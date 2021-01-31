const cors = require('cors')
const express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
const app = express()
const httpServer = require('http').createServer(app)  // tarvittiin webSocketissa ja tämä laitetaan kuuntelemaan!
const port = process.env.PORT || 4000
app.use(bodyParser.json())
app.use(express.static('./client/build'))

const fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
})); 

var appOrigin = null
var con_string = null
if (!process.env.HEROKU) {
  con_string = 'tcp://postgres:MAVLtd@localhost/Tenttikanta';
  appOrigin = 'http://localhost:3000'
  console.log("front:",appOrigin)

} else {
  con_string = process.env.DATABASE_URL
  appOrigin = 'https://tenttimv.herokuapp.com'
  console.log("front:",appOrigin)
}

var corsOptions = {  // tietoturva: määritellään mistä originista sallitaan http-pyynnöt
  origin: appOrigin,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET,PUT,POST,DELETE"
}

app.use(cors(corsOptions))

app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io')) //static socket.io

const db = require('./db')
const { response } = require('express')

var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
const SALT_ROUNDS = 12

var io = require('socket.io')(httpServer, {
  cors: {
    origin: appOrigin,
    methods: ["GET", "POST"]
  }
})

var pg = require('pg'); 
var pg_client = new pg.Client(con_string);
pg_client.connect();
var query = pg_client.query('LISTEN huomio');

io.sockets.on('connection', (socket) => {
    socket.emit('connected', { connected: true });
    socket.on('ready for data', (data) => {
        pg_client.on('notification', (payload) => {
          socket.emit('update', { message: payload });
      });
  });
});

// pg_client.on('notification',async(data)=>{
//   console.log(data.payload); 
// })

//httpServer.listen(9000)

// var requestTime = function (req, res, next) {
//   // req.requestTime = Date.now()
//   console.log('Kello on:',Date.now())
//   next()
// }

// app.use(requestTime)

//------------------------------------------REGISTER--------------------------------------------------------------------------
app.post('/register',(req, res, next) => {
  const body = req.body
  if(!(body.username && body.password && body.role)){      // käyttäjätunnusta tai salasanaa ei annettu
    return res.status(400).json({error: 'Tallennettava tieto puuttuu!' })
  } 

  db.query('SELECT * FROM kayttaja WHERE sahkoposti = $1',[body.username], (err, result) => {
    if (err) {
      return next(err)
    }
      if(result.rows.length > 0){
        return res.status(401).json({ error: 'Tunnus varattu' })
      }
      bcrypt.hash(body.password, SALT_ROUNDS) 
      .then((passwordHash) => {
        const uK = {
          etunimi : body.firstname,
          sukunimi : body.surename,
          sahkoposti : body.username,
          salasana : passwordHash,
          rooli : body.role
        }
        db.query('INSERT INTO kayttaja(etunimi,sukunimi,sahkoposti,salasana,rooli) VALUES($1,$2,$3,$4,$5) RETURNING kayttajaid',[uK.etunimi,uK.sukunimi,uK.sahkoposti,uK.salasana,uK.rooli],(err,result) => {
          if (err) {
            return next(err)
          }
          return res.status(200).send(result.rows)
          })
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({error: 'Hash-ongelma?'})
      })
    })
})

//------------------------------------------LOGIN-----------------------------------------------------------------------------

// login
app.post('/login', (req, res, next) => {
  const body = req.body

  if(!(body.username && body.password)){      // käyttäjätunnusta tai salasanaa ei annettu
    return res.status(401).json({error: 'invalid username or password' })
  } 
  db.query('SELECT * FROM kayttaja WHERE sahkoposti = $1',[body.username])
    .then((user) => {
      if(user.lenght === 0){                  // käyttäjätunnusta ei ole
        return res.status(401).json({ error: 'invalid username or password' })
      }
      const tempUser = user.rows[0];
      bcrypt.compare(body.password, tempUser.salasana)
        .then((passwordCorrect) => {
          if (!passwordCorrect){              // salasana ei ole oikea
            return res.status(401).json({ error: 'invalid username or password'})
          }
          console.log("kirjautuminen onnistui")
          const userForToken = {
            username: tempUser.sahkoposti,
            id: tempUser.kayttajaid,
            rights: tempUser.rooli
          }
          const token = jwt.sign(userForToken, 'tenttiJ') // Token lähtee tässä
            res.status(200).send({token, id: tempUser.kayttajaid, etunimi: tempUser.etunimi, sukunimi: tempUser.sukunimi})
        })
  })
  .catch((err) => {
      console.log(err);
      res.status(401).json(
          { error: 'invalid username or password' }
      )
  })
})   

//------------------------------------------- HAUT ------------------------------------------------------------------------

// haetaan käyttäjät
app.get('/kayttaja', (req, res, next) => {
  db.query('SELECT * FROM kayttaja', (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan käyttäjä
app.get('/kayttaja/:id', (req, res, next) => {
  db.query('SELECT etunimi, sukunimi FROM kayttaja WHERE kayttajaid = $1',[req.params.id], (err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan kurssin ylläpitäjä
app.get('/kurssikasittelija/:id', (req, res, next) => {
  db.query('SELECT kkasittelija_kayttaja_id FROM kurssikasittelija WHERE kkasittelija_kurssi_id = $1',[req.params.id], (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})


// haetaan kurssit
app.get('/kurssi', (req, res, next) => {
  db.query('SELECT * FROM kurssi ORDER BY kurssi', (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan tentit ja kurssit joilla tentti on, sekä tentin ylläpitäjä
app.get('/tentti', (req,res,next) => {
  req.params.ehto = "oppilas"
  db.query('SELECT tentti,tenttiid,minimipisteet,julkaisupvm,kurssi,kurssiid,etunimi,sukunimi,sahkoposti,kayttajaid FROM (((( tentti LEFT JOIN kurssitentti ON kurssi_tentti_id = tenttiid) LEFT JOIN kurssi ON kurssi_kurssi_id = kurssiid) LEFT JOIN tenttikasittelija ON tkasittelija_tentti_id = tenttiid) LEFT JOIN kayttaja ON tkasittelija_kayttaja_id = kayttajaid) ORDER BY tentti', (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan kurssin tentit = tenttivalikko
app.get('/kurssi/:id', (req, res, next) => {
  db.query('SELECT * FROM tentti WHERE tenttiid IN (SELECT kurssi_tentti_id FROM kurssitentti WHERE kurssi_kurssi_id = $1) ORDER BY tentti', [req.params.id], (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan tentin käsittelijät (sekä oppilaat että opettajat, oppilailla on tallennettu tenttialoituspvm)
app.get('/tenttikasittelija/:id', (req, res, next) => {
  db.query('SELECT * FROM tenttikasittelija WHERE tkasittelija_tentti_id = $1', [req.params.id], (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})


// haetaan aihealueet
app.get('/aihe', (req, res, next) => {
  db.query('SELECT * FROM aihe', (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan kaikki kysymykset
app.get('/kysymys', (req, res, next) => {
  db.query('SELECT * FROM kysymys', (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan aihealueen kysymykset
app.get('/kysymys/aihe/:id', (req, res, next) => {
  db.query('SELECT * FROM kysymys WHERE kysymys_aihe_id=$1', [req.params.id],(err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan tentin kaikki kysymykset (kysymys tenttikysymyksissä)
app.get('/kysymys/tentti/:id', (req, res, next) => {
  db.query('SELECT * FROM kysymys WHERE kysymysid IN (SELECT tkysymys_kysymys_id FROM tenttikysymys WHERE tkysymys_tentti_id = $1) ORDER BY kysymysid', [req.params.id], (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan yhden kysymyksen vaihtoehdot (ei vaadita valintaa tenttikysymyksissä)
app.get('/vaihtoehto/kysymys/:id', (req, res, next) => {
  db.query('SELECT * FROM vaihtoehto WHERE vaihtoehto_kysymys_id = $1 ORDER BY vaihtoehtoid', [req.params.id], (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan oppilaan true vastaus/vastaukset kysymykseen
app.get('/kayttaja/:id/kysymys/:id2', (req, res, next) => {
  db.query('SELECT * FROM vastaus WHERE vastaus_kayttaja_id = $1 AND vastaus_vaihtoehto_id IN (SELECT vaihtoehtoid FROM vaihtoehto WHERE vaihtoehto_kysymys_id = $2)', [req.params.id,req.params.id2],(err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// haetaan oppilaan true vastauksen id tentin kysymyksen vaihtoehtoon
app.get('/kayttaja/:id/tentti/:id2/vaihtoehto/:id3',(req, res, next) => {
  db.query('SELECT vastausid FROM (vaihtoehto INNER JOIN vastaus ON vastaus_vaihtoehto_id = vaihtoehtoid) WHERE vastaus_kayttaja_id = $1 AND vastaus_tentti_id = $2	AND vaihtoehtoid = $3', [req.params.id,req.params.id2,req.params.id3],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})    

//------------------------------------------- LISÄYKSET ------------------------------------------------------------------------

// lisätään käyttäjä
app.post('/kayttaja', (req, res, next) => {
  const body = req.body
  if (body.sukunimi==undefined){
    return res.status(400).json({
      error: 'Tallennettava tieto puuttuu!'
    })
  } else {
  db.query('INSERT INTO kayttaja(etunimi,sukunimi,sahkoposti,salasana,rooli) VALUES($1,$2,$3,$4,$5) RETURNING kayttajaid)',[body.etunimi,body.sukunimi,body.sahkoposti,body.salasana,body.rooli],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })}
})

// lisätään uusi kurssi
app.post('/kurssi', (req, res, next) => {
  const body = req.body
  if (body.kurssi==undefined){
    return res.status(400).json({
      error: 'Tallennettava tieto puuttuu!'
    })
  } else {
  db.query('INSERT INTO kurssi(kurssi,aloituspvm) VALUES($1,$2) RETURNING kurssiid',[body.kurssi,body.aloituspvm],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })}
})

// lisätään kurssikäsittelijä
app.post('/kurssikasittelija',(req,res,next) => {
  const body = req.body
  if (body.kkasittelija_kurssi_id==undefined){
    return res.status(400).json({
      error: 'Tarvittava kurssitieto puuttuu!'
    })
  } else {
    db.query('INSERT INTO kurssikasittelija (kkasittelija_kayttaja_id,kkasittelija_kurssi_id) VALUES($1,$2)',[body.kkasittelija_kayttaja_id,body.kkasittelija_kurssi_id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// lisätään uusi tentti
app.post('/tentti', (req, res, next) => {
  const body = req.body
  if (body.tentti==undefined){
    return res.status(400).json({
      error: 'Tallennettava tieto puuttuu!'
    })
  } else {
  db.query('INSERT INTO tentti(tentti) VALUES($1) RETURNING tenttiid',[body.tentti],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })}
})

// lisätään tenttikäsittelijä
app.post('/tenttikasittelija',(req,res,next) => {
  const body = req.body
  if (body.tkasittelija_tentti_id==undefined){
    return res.status(400).json({
      error: 'Tarvittava tenttitieto puuttuu!'
    })
  } else {
    db.query('INSERT INTO tenttikasittelija (tkasittelija_kayttaja_id,tkasittelija_tentti_id,pistemaara,tenttialoituspvm) VALUES($1,$2,$3,$4)',[body.tkasittelija_kayttaja_id,body.tkasittelija_tentti_id,body.pistemaara,body.tenttialoituspvm],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// lisätään tentti kurssille
app.post('/kurssitentti', (req,res,next)=>{
  const body = req.body
  if (body.kurssi_kurssi_id==undefined){
    return res.status(400).json({
      error: 'Tarvittava kurssitieto puuttuu!'
    })
  } else {
    db.query('INSERT INTO kurssitentti(kurssi_kurssi_id,kurssi_tentti_id) VALUES($1,$2)',[body.kurssi_kurssi_id,body.kurssi_tentti_id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// lisätään uusi kysymys
app.post('/kysymys', (req, res, next) => {
  const body = req.body
  if (body.kysymys==undefined){
    return res.status(400).json({
      error: 'Tallennettava tieto puuttuu!'
    })
  } else {
  db.query('INSERT INTO kysymys(kysymys,kysymys_aihe_id) VALUES($1,$2) RETURNING kysymysid',[body.kysymys,body.kysymys_aihe_id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })}
})

// lisätään kysymys tentille
app.post('/tenttikysymys', (req,res,next)=>{
  const body = req.body
  if (body.tkysymys_tentti_id==undefined){
    return res.status(400).json({
      error: 'Tarvittava tenttitieto puuttuu!'
    })
  } else {
    db.query('INSERT INTO tenttikysymys(tkysymys_kysymys_id,tkysymys_tentti_id) VALUES($1,$2)',[body.tkysymys_kysymys_id,body.tkysymys_tentti_id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})


// lisätään uusi vaihtoehto kysymykselle
app.post('/vaihtoehto/kysymys/:id', (req, res, next) => {
  const body = req.body
  body.vaihtoehto_kysymys_id = BigInt(req.params.id)
  if (body.vaihtoehto==undefined){
    return res.status(400).json({
      error: 'Tallennettava tieto puuttuu!'
    })
  } else {
  db.query('INSERT INTO vaihtoehto(vaihtoehto,korrekti,vaihtoehto_kysymys_id) VALUES($1,$2,$3) RETURNING vaihtoehtoid',[body.vaihtoehto,body.valinta,body.vaihtoehto_kysymys_id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })}
})

// lisätään vastaus kysymykseen tentissä
app.post('/vastaus', (req, res, next) => {
  const body = req.body
  if (body.vastaus==undefined){
    return res.status(400).json({
      error: 'Tallennettava tieto puuttuu!'
    })
  } else {
  db.query('INSERT INTO vastaus(vastaus,vastauspvm,vastaus_vaihtoehto_id,vastaus_kayttaja_id,vastaus_tentti_id) VALUES($1,$2,$3,$4,$5) RETURNING vastausid',[body.vastaus,body.vastauspvm,body.vastaus_vaihtoehto_id,body.vastaus_kayttaja_id,body.vastaus_tentti_id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })}
})

//------------------------------------------- MUUTOKSET ------------------------------------------------------------------------

// muutetaan käyttäjä
app.put('/kayttaja/:id', (req, res, next) => {
  const body = req.body
  if (body.sukunimi == undefined){  // tietoa ei välitetty
    return res.status(400).json({
      error: 'Muutettava tieto puuttuu!'
    })
  } else {
    db.query('UPDATE kayttaja SET etunimi=$1,sukunimi=$2,sahkoposti=$3,salasana=$4,rooli=$5 WHERE kayttajaid=$6',[body.etunimi,body.sukunimi,body.sahkoposti,body.salasana,body.rooli,req.params.id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// muutetaan kurssi
app.put('/kurssi/:id', (req, res, next) => {
  const body = req.body
  if (body.kurssi == undefined || body.aloituspvm == undefined){  // tietoa ei välitetty
    return res.status(400).json({
      error: 'Muutettava tieto puuttuu!'
    })
  } else {
    db.query('UPDATE kurssi SET kurssi=$1,aloituspvm=$2 WHERE kurssiid=$3',[body.kurssi,body.aloituspvm,req.params.id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// muutetaan tentti
app.put('/tentti/:id', (req, res, next) => {
  const body = req.body
  if (body.tentti == undefined){  // tietoa ei välitetty
    return res.status(400).json({
      error: 'Muutettava tieto puuttuu!'
    })
  } else {
    db.query('UPDATE tentti SET tentti=$1 WHERE tenttiid=$2',[body.tentti,req.params.id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// muutetaan kysymys
app.put('/kysymys/:id', (req, res, next) => {
  const body = req.body
  console.log(body)
  if (body.kysymys == undefined){  // tietoa ei välitetty
    return res.status(400).json({
      error: 'Muutettava tieto puuttuu!'
    })
  } else {
    db.query('UPDATE kysymys SET kysymys=$1,kysymys_aihe_id=$2 WHERE kysymysid=$3',[body.kysymys,body.kysymys_aihe_id,req.params.id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// muutetaan vaihtoehto
app.put('/vaihtoehto/:id', (req, res, next) => {
  const body = req.body
  if (body.vaihtoehto == undefined){  // tietoa ei välitetty
    return res.status(400).json({
      error: 'Muutettava tieto puuttuu!'
    })
  } else {
    db.query('UPDATE vaihtoehto SET vaihtoehto=$1,korrekti=$2,vaihtoehto_kysymys_id=$3 WHERE vaihtoehtoid=$4',[body.vaihtoehto,body.korrekti,body.vaihtoehto_kysymys_id,req.params.id],(err,result) => {
      if (err) {
        return next(err)
      }
      res.send(result.rows)
  })}
})

// muutetaan vastausta (eli jos vaihdetaan true falseksi, POISTETAAN vastaus)
app.delete('/vastaus/:id', (req, res, next) => {
  db.query('DELETE FROM vastaus WHERE vastausid=$1', [req.params.id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

//------------------------------------------- POISTOT ------------------------------------------------------------------------


// poistetaan kurssi
app.delete('/kurssi/:id', (req, res, next) => {
  db.query('DELETE FROM kurssi WHERE kurssiid=$1',[req.params.id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan kurssikäsittelijä kurssilta
app.delete('/kurssikasittelija/:id/kurssi/:id2', (req, res, next) => {
  db.query('DELETE FROM kurssikasittelija WHERE kkasittelija_kayttaja_id=$1 AND kkasittelija_kurssi_id=$2',[req.params.id,req.params.id2],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan tentti
app.delete('/tentti/:id', (req, res, next) => {
  db.query('DELETE FROM tentti WHERE tenttiid=$1',[req.params.id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan kurssitentti kurssilta
app.delete('/kurssitentti/:id/kurssi/:id2', (req, res, next) => {
  db.query('DELETE FROM kurssitentti WHERE kurssi_tentti_id=$1 AND kurssi_kurssi_id=$2',[req.params.id,req.params.id2],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan tenttikäsittelijä tentiltä
app.delete('/tenttikasittelija/:id/tentti/:id2', (req, res, next) => {
  db.query('DELETE FROM tenttikasittelija WHERE tkasittelija_kayttaja_id=$1 AND tkasittelija_tentti_id=$2',[req.params.id,req.params.id2],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan kysymys
app.delete('/kysymys/:id', (req, res, next) => {
  db.query('DELETE FROM kysymys WHERE kysymysid=$1',[req.params.id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan tenttikysymys tentiltä
app.delete('/tenttikysymys/:id/tentti/:id2', (req, res, next) => {
  db.query('DELETE FROM tenttikysymys WHERE tkysymys_kysymys_id=$1 AND tkysymys_tentti_id=$2',[req.params.id,req.params.id2],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

// poistetaan vaihtoehto
app.delete('/vaihtoehto/:id', (req, res, next) => {
  db.query('DELETE FROM vaihtoehto WHERE vaihtoehtoid=$1',[req.params.id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })
})

//------------------------------------------- TARKISTUS ------------------------------------------------------------------------

// kysymys mukana tenteissä, joiden alkamispäivät
app.get('/kysymys/:id/tentti', (req,res,next) => {
  db.query('SELECT tkysymys_tentti_id,kurssi,aloituspvm FROM ((kurssi INNER JOIN kurssitentti ON kurssi_kurssi_id = kurssiid) INNER JOIN tenttikysymys ON tkysymys_tentti_id = kurssi_tentti_id) WHERE tkysymys_kysymys_id = $1',[req.params.id],(err,result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows)
  })    
})

//---------------------------Drag'n'drop-------------------------------------------------------------
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    } else {
      console.log(req.files)
      let data = []                         // yksittäinen tiedosto ei tule taulukkona
      if(!Array.isArray(req.files.file)) {  // eli tässä tulee vain yksittäinen tiedosto
        req.files.file.mv('./uploads/'+req.files.file.name)
        data.push({
          name: req.files.file.name,
          type: req.files.file.mimetype,
          size: req.files.file.size
        })
      } else {                                        // tulee useampi tiedosto kerralla
        Object.keys(req.files.file).forEach(item => { // ja taulukko käydään läpi tässä
          req.files.file[item].mv('./uploads/'+req.files.file[item].name) 
          data.push({
            name: req.files.file[item].name,
            type: req.files.file[item].mimetype,
            size: req.files.file[item].size
          })
        })
      } 
      res.send({
        message: 'Uploaded',
        data: data
      })
    }
  } catch (err) {
     res.status(500).send(err)
  }
});

// --------------------------Älä kommentoi pois ------------------------------------------------------
app.get('*', (req,res)=>{
  console.log("Palvellaan index.html")
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

httpServer.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})


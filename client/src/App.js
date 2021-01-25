import React, { useEffect, useReducer, useCallback } from 'react';
import { useState } from 'react'
import './oma.css';
import { useDropzone } from 'react-dropzone';
import request from 'superagent';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import BuildIcon from '@material-ui/icons/Build';
import Axios from 'axios'
import Login from './components/login'
import Register from './components/register'
import {
  muutaTentti,
  lisaaTentti,
} from './components/dataManipulation.js';
import initialData from './components/initialData.js'
import Kurssivalikko from './components/kurssivalinta.js'
import Tenttivalikko from './components/tenttivalinta.js'
import reducer from './components/reducer.js';
import Kysymykset from './components/kysymykset.js';
import ChartExample from './components/chart.js';
import ConfirmDialog from './components/confirmDialog.js';
import strings from './components/merkkijonot.js';
import socketIOClient from "socket.io-client";
import { useSnackbar } from "notistack";

function App() {

  const versio = "ver. 0.55"
  const [dataAlustettu, setDataAlustettu] = useState(false)
  const [state, dispatch] = useReducer(reducer, [])
  const [tentit, setTentit] = useState(0)
  const [tietoa, setTietoa] = useState(0)
  const [vastaukset, setVastaukset] = useState(0)
  const [aktiivinenTentti, setAktiivinenTentti] = useState(null)
  const [aktiivinenKurssi, setAktiivinenKurssi] = useState(null)
  const [aktiivinenKayttaja, setAktiivinenKayttaja] = useState(null)
  const [hallinta, setHallinta] = useState(0)
  const [kaaviot, setKaaviot] = useState(0)
  const [vahvista, setVahvista] = useState(0)
  const [authToken, setAuthToken] = useState("")
  const [login, setLogin] = useState(false)
  const [register, setRegister] = useState(false)
  const [kurssiData, setKurssiData] = useState([])
  const [kurssiDataIndex, setKurssiDataIndex] = useState(null)
  const [kayttajaNimi, setKayttajaNimi] = useState("")
  const [tenttiData, setTenttiData] = useState([])
  const [vahvistusOtsikko, setVahvistusOtsikko] = useState("")
  const [vahvistusTeksti, setVahvistusTeksti] = useState("")
  const [vahvistusTehtava, setVahvistusTehtava] = useState("")
  const [vahvistusPoisto, setVahvistusPoisto] = useState("")
  const [sviesti, setSviesti] = useState("")
  const endPoint = "ws://localhost:9000"
  const lang = navigator.language
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {

    // const createData = async () => {
    //   try {
    //     let result = await Axios.post("http://localhost:3001/tentit/",initialData)
    //     dispatch({type: "INIT_DATA", data: initialData})
    //     setDataAlustettu(true)
    //   } catch (exception) {
    //     alert("Tietokannan alustaminen epäonnistui!")
    //   }
    // }

    const fetchKurssiData = async () => { // hakee yhden kurssin tenttien tiedot ja yhden käyttäjän antamat vastaukset kurssin tenttien kysymyksiin
      if (aktiivinenKurssi !== null) {
        try {
          // let result = await Axios.get("http://localhost:3001/tentit/")
          let kurssiid = aktiivinenKurssi
          let kayttajaid = aktiivinenKayttaja // oppilas eli vastaukset yhdeltä oppilaalta
          let result = await Axios.get("http://localhost:4000/kurssi/" + kurssiid)
          if (result.data.length > 0) {
            for (var i = 0; i < result.data.length; i++) {       // käydään läpi noudetun kurssin tentit
              result.data[i].kysymykset = []
              let kysymykset = await Axios.get("http://localhost:4000/kysymys/tentti/" + result.data[i].tenttiid)
              result.data[i].kysymykset = kysymykset.data
              if (result.data[i].kysymykset.length > 0) {
                for (var j = 0; j < result.data[i].kysymykset.length; j++) { // käydään läpi noudetut tentin kysymykset
                  result.data[i].kysymykset[j].vaihtoehdot = []
                  let vaihtoehdot = await Axios.get("http://localhost:4000/vaihtoehto/kysymys/" + result.data[i].kysymykset[j].kysymysid)
                  result.data[i].kysymykset[j].vaihtoehdot = vaihtoehdot.data
                  let vastaukset = await Axios.get("http://localhost:4000/kayttaja/" + kayttajaid + "/kysymys/" + result.data[i].kysymykset[j].kysymysid)
                  if (result.data[i].kysymykset[j].vaihtoehdot.length > 0) {
                    for (var k = 0; k < result.data[i].kysymykset[j].vaihtoehdot.length; k++) {  // käydään läpi noudetut kysymyksen vaihtoehdot
                      result.data[i].kysymykset[j].vaihtoehdot[k].valittu = false               // käyttäjän vastaukset alustetaan falsella
                      if (vastaukset.data.length > 0) {
                        for (var l = 0; l < vastaukset.data.length; l++) {                       // käydään läpi onko käyttäjä valinnut vaihtoehdon oikeaksi
                          if (result.data[i].kysymykset[j].vaihtoehdot[k].vaihtoehtoid === vastaukset.data[l].vastaus_vaihtoehto_id) {
                            result.data[i].kysymykset[j].vaihtoehdot[k].valittu = true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            console.log(result.data)
            dispatch({ type: "INIT_DATA", data: result.data })
            setDataAlustettu(true)
          } else {
            result.data = []
            dispatch({ type: "INIT_DATA", data: result.data })
            throw ("Nyt pitää data kyllä alustaa!")
          }
        }
        catch (execption) {
          console.log(execption)
          // createData()
        }

      }
    }

    fetchKurssiData();
  }, [aktiivinenKayttaja, aktiivinenKurssi])

  // useEffect(() => {

  // const updateData = async () => {
  //   try {
  //      let result = await Axios.put("http://localhost:3001/tentit", state)
  //   } catch (exception) {
  //     console.log(exception)
  //   }
  // }

  // if (dataAlustettu) {
  //   updateData();
  // }  

  // }, [state])

  let headers = {
    headers: { Authorization: `FrontKey ${authToken}` },
  }

  const userHook = () => {
    const loggedUserJSON = window.localStorage.getItem('loggedAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setAuthToken(user.token)
    }
  }

  useEffect(userHook, [])

  const onDrop = useCallback(files => {
    console.log(files);

    const req = request.post('http://localhost:4000/upload');

    files.forEach(file => {
      req.attach('file', file);
    });
    req.end((err, res) => {
      console.log(res)
    });

  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  useEffect(() => {

    const socket = socketIOClient(endPoint);

    socket.on('connected', function (data) {
      console.log("Socket.io: Connected")
      socket.emit('ready for data', {});
    });
    socket.on('update', function (data) {
      console.log(data.message.payload)
      enqueueSnackbar(data.message.payload, 'info')
    });
  }, []);


  const tarkistaLogin = async (e, userdata) => {
    e.preventDefault();
    try {
      let kayttaja = await Axios.post("http://localhost:4000/login", userdata)
      if (kayttaja.lenght === 0) {
        console.log("Invalid username of password")
        return
      }
      console.log(kayttaja)
      setLogin(true)
      setAktiivinenKayttaja(kayttaja.data.id)
      setKayttajaNimi(`${kayttaja.data.etunimi} ${kayttaja.data.sukunimi} (${lang})`)
    } catch (exception) {
      console.log(exception)
    }
  }

  const luoTunnus = async (e, uusiKayttaja) => {
    e.preventDefault();

    try {
      let kayttaja = await Axios.post("http://localhost:4000/register", uusiKayttaja)
      if (kayttaja.lenght === 0) {
        console.log("missä mättää?")
        return
      }
      console.log(kayttaja)
      setRegister(false)
      setAktiivinenKayttaja(kayttaja.data.id)
    } catch (exception) {
      console.log(exception)
    }
  }

  return (
    <div>{login ? <section className="grid-container">
      <nav className="sovellusvalikko">
        <span className="s-nav-item" onClick={e => {
          setTentit(0); setTietoa(0); setAktiivinenTentti(null); setAktiivinenKurssi(null); setKurssiDataIndex(null);
        }}>{strings.kurssit} </span>
        {kurssiDataIndex !== null ? <span className="s-nav-item" onClick={e => {
          setAktiivinenTentti(null); setTentit(1); setTietoa(0); setVastaukset(0); setKaaviot(0);
        }}>{strings.tentit} </span> : <span className="s-nav-item" onClick={e => {
          setTentit(1); setTietoa(0); setAktiivinenTentti(null); setAktiivinenKurssi(null); setKurssiDataIndex(null);
        }}>{strings.tentit} </span>}
        <span className="s-nav-item" onClick={e => {
          setTentit(0); setKaaviot(0); setTietoa(1);
        }}>{strings.tietoa}</span>
        <span className="s-nav-item" onClick={e => {
          setHallinta(!hallinta)
        }}><BuildIcon fontSize="small" /> </span>
        <span className="s-nav-item-right" onClick={e => {      // POISTU toiminto tässä !!!!!!!!
          setTentit(0); setKaaviot(0); setLogin(false); setAktiivinenKayttaja(null); setAktiivinenKurssi(null);
          window.localStorage.removeItem('loggedAppUser');
          window.location.reload();
        }}>{strings.poistu} </span>
        <span className="s-nav-item-right">{kayttajaNimi} - </span>
      </nav>
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ? "" : ""
        }
      </div>
      {aktiivinenKurssi === null && !tentit ?      // kurssivalikko näkyviin, ei vielä valittua kurssia
        <section className="tenttivalikko">
          <Kurssivalikko aktiivinenKurssi={aktiivinenKurssi} setAktiivinenKurssi={setAktiivinenKurssi} kurssiData={kurssiData} setKurssiData={setKurssiData} tentit={tentit} setTentit={setTentit} kurssiDataIndex={kurssiDataIndex} setKurssiDataIndex={setKurssiDataIndex} lang={lang} />
        </section>
        : aktiivinenKurssi === null && tentit ?      // tenttivalikko näkyviin, ei ole valittua kurssia
          <section className="tenttivalikko">
            <Tenttivalikko tenttiData={tenttiData} setTenttiData={setTenttiData} aktiivinenTentti={aktiivinenTentti} setAktiivinenTentti={setAktiivinenTentti} aktiivinenKurssi={aktiivinenKurssi} setAktiivinenKurssi={setAktiivinenKurssi} kurssiData={kurssiData} setKurssiDataIndex={setKurssiDataIndex} lang={lang} />
          </section> : aktiivinenKurssi !== null && tentit ?   // kurssi valittu, näytetään kurssin tentit
            <div className="grid-item"> {strings.kurssi} <span className="kurssivalinta">{kurssiData[kurssiDataIndex].kurssi}</span>
              <nav className="tenttivalikko">
                {aktiivinenTentti === null ?              // ei ole vielä valittu kurssilta tenttiä
                  state.map((item, index) =>
                    <span className="t-nav-item" key={item.tenttiid} onClick={() => {
                      setAktiivinenTentti(index); setVastaukset(0)
                    }}>{item.tentti}
                    </span>)
                  : hallinta && aktiivinenTentti !== null ?  // hallintatila ja tentti kurssilta valittuna
                    <span>
                      {/* <input type="text" value={state[aktiivinenTentti].tentti} onChange={(event) =>{ */}
                      <input type="text" defaultValue={state[aktiivinenTentti].tentti} id={state[aktiivinenTentti].tenttiid} onBlur={(event) => {
                        var newText = document.getElementById(state[aktiivinenTentti].tenttiid);
                        newText.value = newText.value.toUpperCase();
                        muutaTentti(dispatch, newText, state[aktiivinenTentti], aktiivinenTentti)
                      }}>
                      </input> <button className="delButton" onClick={() => {   // poistakurssinappulan toiminto
                        // if (window.confirm("Poistetaanko tentti ("+state[aktiivinenTentti].tentti+") kurssilta?")){
                        //   poistaTenttiKurssilta(dispatch,state[aktiivinenTentti],aktiivinenTentti,aktiivinenKurssi)
                        //   setAktiivinenTentti(null)}
                        setVahvista(true); setVahvistusOtsikko(strings.tpoisto); setVahvistusTeksti(`${strings.tvahvistus} (${state[aktiivinenTentti].tentti})?`); setVahvistusTehtava("poistaTenttiKurssilta"); setVahvistusPoisto(aktiivinenTentti); setAktiivinenTentti(null)
                      }}><DeleteTwoToneIcon /></button>
                    </span> : state[aktiivinenTentti].tentti}
                {hallinta && aktiivinenTentti === null ? <span className="add-item" onClick={() => { // lisätään uutta tenttiä kurssille
                  var uusiTenttiNimi = "uusi";
                  lisaaTentti(dispatch, uusiTenttiNimi, aktiivinenKurssi, aktiivinenKayttaja)
                }}> + </span> : ""}
              </nav>
            </div>
            : tietoa ?
              <section className="vastaus">{window.open("https://www.youtube.com/watch?v=sAqnNWUD79Q", "_self")}</section> : ""}
        {(aktiivinenTentti !== null && !tietoa && !kaaviot) ?
         <Kysymykset dispatch={dispatch} data={state[aktiivinenTentti]} tenttiIndex={aktiivinenTentti} vastaukset={vastaukset} setVastaukset={setVastaukset} hallinta={hallinta} setHallinta={setHallinta} kaaviot={kaaviot} setKaaviot={setKaaviot} setVahvista={setVahvista} vahvista={vahvista} setVahvistusOtsikko={setVahvistusOtsikko} vahvistusOtsikko={vahvistusOtsikko} setVahvistusTeksti={setVahvistusTeksti} vahvistusTeksti={vahvistusTeksti} setVahvistusTehtava={setVahvistusTehtava} vahvistusTehtava={vahvistusTehtava} setVahvistusPoisto={setVahvistusPoisto} vahvistusPoisto={vahvistusPoisto} />
        : kaaviot ?
          <section className="charts">
            <ChartExample otsikot={strings.gotsikot} tiedot={[5, 22, 10, 10]} tyyppi={strings.jakauma} valinta={"Doughnut"} />
            <ChartExample otsikot={strings.gotsikot} tiedot={[5, 22, 10, 10]} tyyppi={strings.aluepisteet} valinta={"Bar"} />
            <button className="button" onClick={() => { setKaaviot(0) }}>{strings.paluu}</button>
          </section> : vahvista ? <ConfirmDialog otsikko={vahvistusOtsikko} teksti={vahvistusTeksti} vahvista={vahvista} setVahvista={setVahvista} onConfirmAction={vahvistusTehtava} dispatch={dispatch} data={state[vahvistusPoisto]} index={vahvistusPoisto} index2={aktiivinenKurssi} /> :""}
    </section>
      : register ?
        <section className="grid-container">
          <nav className="sovellusvalikko"><span className="s-nav-item">{strings.tervetuloa}</span><span className="s-nav-item-right">{versio}</span></nav>
          <Register luoTunnus={luoTunnus} register={register} setRegister={setRegister} />
        </section>
        : <section className="grid-container">
          <nav className="sovellusvalikko"><span className="s-nav-item">{strings.tervetuloa}</span><span className="s-nav-item-right">{versio}</span></nav>
          <Login handleSubmit={tarkistaLogin} register={register} setRegister={setRegister} />
        </section>}
    </div>
  )
}
export default App;

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
  fetchKurssinData,
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

  const versio = "ver. 0.65"
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
  const [vahvistusPoisto2, setVahvistusPoisto2] = useState("")
  const lang = navigator.language
  const { enqueueSnackbar } = useSnackbar();

  var path = null
  var endpoint = null
  switch (process.env.NODE_ENV) {
    case 'production':
      path = 'https://tenttimv.herokuapp.com/'
      endpoint = 'https://tenttimv.herokuapp.com'
      break;
    case 'development':
      path = 'http://localhost:4000/'
      endpoint = 'http://localhost:4000'
      break;
    case 'test':
      path = 'http://localhost:4000/'
      break;
    default:
      throw new Error("Check environment settings")
  }

  // useEffect(() => {

  //   // const createData = async () => {
  //   //   try {
  //   //     let result = await Axios.post("http://localhost:3001/tentit/",initialData)
  //   //     dispatch({type: "INIT_DATA", data: initialData})
  //   //     setDataAlustettu(true)
  //   //   } catch (exception) {
  //   //     alert("Tietokannan alustaminen epäonnistui!")
  //   //   }
  //   // }
 
  //   fetchKurssinData(dispatch,aktiivinenKayttaja,aktiivinenKurssi,path);

  // }, [aktiivinenKurssi])

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
    headers: { Authorization: `bearer ${authToken}` },
  }

  const userHook = () => {
    const loggedUserJSON = window.localStorage.getItem('loggedAppUser')
    if (loggedUserJSON) {
      let kayttaja = JSON.parse(loggedUserJSON)
      console.log(kayttaja)
      setAuthToken(kayttaja.token)
    }
  }

  useEffect(userHook, [])

  const onDrop = useCallback(files => {
    console.log(files);

    const req = request.post(`${path}upload`);

    files.forEach(file => {
      req.attach('file', file);
    });
    req.end((err, res) => {
      console.log(res)
    });

  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  useEffect(() => {

    const socket = socketIOClient(endpoint);

    socket.on('connected', function (data) {
      console.log("Socket.io: Connected")
      socket.emit('ready for data', {});
    });
    socket.on('update', function (data) {
      console.log(data.message.payload)
      enqueueSnackbar(data.message.payload, 'info')
    });
    return () => socket.disconnect();
  }, [endpoint,enqueueSnackbar]);


  const tarkistaLogin = async (e, userdata) => {
    e.preventDefault();
    try {
      let kayttaja = await Axios.post(path + "login", userdata)
      if (kayttaja.lenght === 0) {
        console.log("Invalid username of password")
        return
      }
      setLogin(true)
      console.log(kayttaja.data.token)
      setAuthToken(kayttaja.data.token)
      setAktiivinenKayttaja(kayttaja.data.id)
      window.localStorage.setItem('loggedAppUser', JSON.stringify(kayttaja.data))
      setKayttajaNimi(`${kayttaja.data.etunimi} ${kayttaja.data.sukunimi} (${lang})`)
    } catch (exception) {
      console.log(exception)
    }
  }
  
  const luoTunnus = async (e, uusiKayttaja) => {
    e.preventDefault();
  
    try {
      let kayttaja = await Axios.post(path + "register", uusiKayttaja)
      if (kayttaja.lenght === 0) {
        console.log("missä mättää?")
        return
      }
      setRegister(false)
      setAktiivinenKayttaja(kayttaja.data.id)
    } catch (exception) {
      console.log(exception)
    }
  }
  
  

  return (
    <div>
      {login ? <section className="grid-container">
        <nav className="sovellusvalikko">
          <span className="s-nav-item" onClick={e => {        // kaikki KURSSIT näkyviin
              setTentit(0); setTietoa(0); setAktiivinenTentti(null); setAktiivinenKurssi(null); setKurssiDataIndex(null);
            }}> {strings.kurssit} 
          </span> 
          {kurssiDataIndex !== null ? 
            <span className="s-nav-item" onClick={e => {      // valitun kurssin TENTIT näkyviin
                setAktiivinenTentti(null); setTentit(1); setTietoa(0); setVastaukset(0); setKaaviot(0);
              }}> {strings.tentit} 
            </span> : 
            <span className="s-nav-item" onClick={e => {      // kaikki TENTIT näkyviin (ei ole valittua kurssia)
                setTentit(1); setTietoa(0); setAktiivinenTentti(null); setAktiivinenKurssi(null); setKurssiDataIndex(null);
              }}> {strings.tentit} 
            </span>}
          <span className="s-nav-item" onClick={e => {
               window.open("https://www.youtube.com/watch?v=sAqnNWUD79Q","","width=800, height=600, top=140, left=0")
              // setTietoa(1);      // näytetään TIETOA
            }}> {strings.tietoa}
          </span>
          <span className="s-nav-item" onClick={e => {        // vaihdetaan HALLINTA (päälle/pois)
              setHallinta(!hallinta)
            }}> <BuildIcon fontSize="small"/> 
          </span>
          <span className="s-nav-item-right" onClick={e => {  // POISTUTAAN
              setTentit(0); setKaaviot(0); setLogin(false); setAktiivinenKayttaja(null); setAktiivinenKurssi(null);
              window.localStorage.removeItem('loggedAppUser');
              window.location.reload();
            }}> {strings.poistu} 
          </span>
          <span className="s-nav-item-right"> {kayttajaNimi} - </span>
        </nav>
        <div className="dropzone" {...getRootProps()}>
          DROP ZONE       
          <input {...getInputProps()} />
          {                                                   // DROPZONE
            isDragActive ? "" : ""
          }
        </div>
        {aktiivinenKurssi === null && !tentit ?               // kurssivalikko näkyviin, ei vielä valittua kurssia

            <div className="grid-subContainer">
              <div className="otsikko">
                <section className="tenttivalikko">
                  {strings.kurssivalinta}
                </section>
              </div>
              <div className="grid-item2">
                <Kurssivalikko 
                  path={path}
                  dispatch={dispatch}
                  aktiivinenKayttaja={aktiivinenKayttaja}
                  aktiivinenKurssi={aktiivinenKurssi} setAktiivinenKurssi={setAktiivinenKurssi}
                  kurssiData={kurssiData} setKurssiData={setKurssiData} 
                  tentit={tentit} setTentit={setTentit} 
                  kurssiDataIndex={kurssiDataIndex} setKurssiDataIndex={setKurssiDataIndex} 
                  lang={lang} />
              </div>
              <div><p><br/></p></div>
            </div>
        : aktiivinenKurssi === null && tentit ?               // tenttivalikko näkyviin, ei ole valittua kurssia

            <div className="grid-subContainer">
              <div className="otsikko">
                <section className="tenttivalikko">
                  {strings.tenttivalinta}
                </section>
              </div>
              <div className="grid-item2">
                <Tenttivalikko 
                  path={path}
                  dispatch={dispatch}
                  aktiivinenKayttaja={aktiivinenKayttaja}
                  tenttiData={tenttiData} setTenttiData={setTenttiData} 
                  aktiivinenTentti={aktiivinenTentti} setAktiivinenTentti={setAktiivinenTentti} 
                  tentit={tentit} setTentit={setTentit} 
                  aktiivinenKurssi={aktiivinenKurssi} setAktiivinenKurssi={setAktiivinenKurssi} 
                  kurssiData={kurssiData} 
                  setKurssiDataIndex={setKurssiDataIndex} 
                  lang={lang} />
              </div>
              <div><p><br/></p></div>
            </div>
        : aktiivinenKurssi !== null && tentit ?               // kurssi valittu, näytetään kurssin tentit
          // <div className="grid-item"> {strings.kurssi}
          <div className="grid-subContainer">
            <div className="otsikko"> {strings.kurssi} <span className="kurssivalinta">{kurssiData[kurssiDataIndex].kurssi}
              </span> {/* valitun kurssin nimi */}
              <nav className="tenttivalikko">
                {aktiivinenTentti === null ?                      // ei ole vielä valittu kurssilta tenttiä
                  state.map((item, index) =>                      // eli näytetään kurssin tentit valintaa varten
                  <span className="t-nav-item" key={item.tenttiid} onClick={() => {
                      setAktiivinenTentti(index); 
                      setVastaukset(0)
                    }}>{item.tentti}
                  </span>)
                : hallinta && aktiivinenTentti !== null && !vahvista ?         // hallintatila ja tentti kurssilta valittuna
                <span className="t-nav-item">
                  <input type="text" defaultValue={state[aktiivinenTentti].tentti} id={state[aktiivinenTentti].tenttiid} onBlur={(event) => {
                      var newText = document.getElementById(state[aktiivinenTentti].tenttiid);
                      newText.value = newText.value.toUpperCase();
                      muutaTentti(dispatch, newText, state[aktiivinenTentti], aktiivinenTentti)
                    }}>
                  </input> <button className="delButton" onClick={() => {   // poistakurssinappulan toiminto
                      setVahvistusOtsikko(strings.tpoisto); 
                      setVahvistusTeksti(`${strings.tvahvistus} (${state[aktiivinenTentti].tentti})?`); 
                      setVahvistusTehtava("poistaTenttiKurssilta"); 
                      setVahvistusPoisto(aktiivinenTentti); 
                      setVahvistusPoisto2(aktiivinenKurssi); 
                      setVahvista(true); 
                    }}><DeleteTwoToneIcon />
                  </button>
                </span> 
                : // tentti on valittu ja näytetään vain valitun tentin nimi
                <span className="t-nav-item" >
                  {state[aktiivinenTentti].tentti}
                </span>}
                {hallinta && aktiivinenTentti === null ?
                <span className="add-item" onClick={() => { // lisätään uutta tenttiä kurssille
                    var uusiTenttiNimi = "uusi";
                    lisaaTentti(dispatch, uusiTenttiNimi, aktiivinenKurssi, aktiivinenKayttaja)
                  }}> + 
                </span>
                : ""}
              </nav>
            </div>
            <div className="grid-item2">
              {aktiivinenTentti !== null && !kaaviot && !vahvista?
                <div className="content">
                  <Kysymykset dispatch={dispatch} data={state[aktiivinenTentti]} tenttiIndex={aktiivinenTentti}
                    vastaukset={vastaukset} setVastaukset={setVastaukset} hallinta={hallinta} setHallinta={setHallinta} 
                    kaaviot={kaaviot} setKaaviot={setKaaviot} setVahvista={setVahvista} vahvista={vahvista} 
                    setVahvistusOtsikko={setVahvistusOtsikko} vahvistusOtsikko={vahvistusOtsikko} 
                    setVahvistusTeksti={setVahvistusTeksti} vahvistusTeksti={vahvistusTeksti} 
                    setVahvistusTehtava={setVahvistusTehtava} vahvistusTehtava={vahvistusTehtava} 
                    setVahvistusPoisto={setVahvistusPoisto} vahvistusPoisto={vahvistusPoisto} 
                    setVahvistusPoisto2={setVahvistusPoisto2} vahvistusPoisto2={vahvistusPoisto2}/>
                </div>
              : vahvista ? 
                <div className="content">
                  <ConfirmDialog aktiivinenTentti={aktiivinenTentti} setAktiivinenTentti={setAktiivinenTentti}
                      otsikko={vahvistusOtsikko} teksti={vahvistusTeksti} 
                      vahvista={vahvista} setVahvista={setVahvista} 
                      onConfirmAction={vahvistusTehtava} dispatch={dispatch} 
                      data={state[aktiivinenTentti]} index={vahvistusPoisto} index2={vahvistusPoisto2} />
                </div>
              : kaaviot ?
                <div className="content">
                  <section className="charts">
                    <ChartExample otsikot={strings.gotsikot} 
                        tiedot={[5, 22, 10, 10]} 
                        tyyppi={strings.jakauma} 
                        valinta={"Doughnut"} />
                    <ChartExample otsikot={strings.gotsikot} 
                        tiedot={[5, 22, 10, 10]} 
                        tyyppi={strings.aluepisteet} 
                        valinta={"Bar"} />
                    <button className="button" onClick={() => { 
                      setKaaviot(0) }}>{strings.paluu}
                    </button>
                  </section>  
                </div>
              :""}
              <div><p><br/></p></div>
            </div>
          </div>
        : ""}        
      </section>
      : register ?
      <section className="grid-container">
        <nav className="sovellusvalikko">
          <span className="s-nav-item">{strings.tervetuloa}</span>
          <span className="s-nav-item-right">{versio}</span>
        </nav>
        <div className="grid-subContainer">
          <div className="otsikko"></div>
          <div className="grid-item2">
            <Register luoTunnus={luoTunnus} register={register} setRegister={setRegister} />
          </div>
          <div><p><br/></p></div>
        </div>
      </section>
      : 
      <section className="grid-container">
        <nav className="sovellusvalikko">
          <span className="s-nav-item">{strings.tervetuloa}</span>
          <span className="s-nav-item-right">{versio}</span>
        </nav>
        <div className="grid-subContainer">
          <div className="otsikko"></div>
          <div className="grid-item2">
            <Login handleSubmit={tarkistaLogin} register={register} setRegister={setRegister} />
          </div>
          <div><p><br/></p></div>
        </div>
      </section>}
  </div>)
}
export default App;

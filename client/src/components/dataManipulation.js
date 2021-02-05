import Axios from 'axios';

const lang = navigator.language

var path = null
switch (process.env.NODE_ENV) {
  case 'production':
    path = 'https://tenttimv.herokuapp.com/'
    break;
  case 'development':
    path = 'http://localhost:4000/'
    break;
  case 'test':
    path = 'http://localhost:4000/'
    break;
  default:
    throw new Error("Check environment settings")
} 

const fetchKurssinData = async (dispatch,aktiivinenKurssi,aktiivinenKayttaja,path) => { // hakee yhden kurssin tenttien tiedot ja yhden käyttäjän antamat vastaukset kurssin tenttien kysymyksiin
  if (aktiivinenKurssi !== null) {
    try {
      // let result = await Axios.get("http://localhost:3001/tentit/")
      let kurssiid = aktiivinenKurssi
      let kayttajaid = aktiivinenKayttaja // oppilas eli vastaukset yhdeltä oppilaalta
      let result = await Axios.get(path + "kurssi/" + kurssiid)
      if (result.data.length > 0) {
        for (var i = 0; i < result.data.length; i++) {       // käydään läpi noudetun kurssin tentit
          result.data[i].kysymykset = []
          let kysymykset = await Axios.get(path + "kysymys/tentti/" + result.data[i].tenttiid)
          result.data[i].kysymykset = kysymykset.data
          if (result.data[i].kysymykset.length > 0) {
            for (var j = 0; j < result.data[i].kysymykset.length; j++) { // käydään läpi noudetut tentin kysymykset
              result.data[i].kysymykset[j].vaihtoehdot = []
              let vaihtoehdot = await Axios.get(path + "vaihtoehto/kysymys/" + result.data[i].kysymykset[j].kysymysid)
              result.data[i].kysymykset[j].vaihtoehdot = vaihtoehdot.data
              let vastaukset = await Axios.get(path + "kayttaja/" + kayttajaid + "/kysymys/" + result.data[i].kysymykset[j].kysymysid)
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
        // setDataAlustettu(true)
      } else {
        result.data = []
        dispatch({ type: "INIT_DATA", data: result.data })
        throw new Error("Nyt pitää data kyllä alustaa!")
      }
    }
    catch (execption) {
      console.log(execption)
      // createData()
    }

  }
}

  const fetchKurssit = async (kurssiData,setKurssiData) => {
    try {
      let kurssitiedot = []
      let result = await Axios.get(path + "kurssi")
      if (result.data.length > 0){
        for (var i = 0; i < result.data.length; i++){
          let kurssitieto = {
            kurssiid : result.data[i].kurssiid,
            kurssi : result.data[i].kurssi,
            // aloituspvm : new Date(result.data[i].aloituspvm).toLocaleDateString()
            aloituspvm : new Intl.DateTimeFormat(lang).format(new Date(result.data[i].aloituspvm))
          }
          kurssitiedot = kurssitiedot.concat(kurssitieto)
        }
        setKurssiData(kurssitiedot)
        return
      }
    }
    catch (exception) {
      console.log(exception)
    }
  };

  const fetchTentit = async (tenttiData,setTenttiData) => {
    try {
      let tenttitiedot = []
      let result = await Axios.get(path + "tentti")
      if (result.data.length > 0){
        for (var i = 0; i < result.data.length; i++){
          let tenttitieto = {
            tenttiid : result.data[i].tenttiid,
            tentti : result.data[i].tentti,
            minimipisteet: result.data[i].minimipisteet,
            julkaisupvm: new Intl.DateTimeFormat(lang).format(new Date(result.data[i].julkaisupvm)),
            // julkaisupvm: new Date(result.data[i].julkaisupvm).toLocaleDateString(),
            kurssiid: result.data[i].kurssiid,
            kurssi: result.data[i].kurssi,
            etunimi: result.data[i].etunimi,
            sukunimi: result.data[i].sukunimi,
            kayttajaid: result.data[i].kayttajaid,
            sahkoposti: result.data[i].sahkoposti,
            kysymykset: []
          }
          tenttitiedot = tenttitiedot.concat(tenttitieto)
        }
        setTenttiData(tenttitiedot)
        return
      }
    }
    catch (exception) {
      console.log(exception)
    }
  };


  const muutaTentti = async(dispatch,event,data,aktiivinenTentti) => {
    let id = data.tenttiid
    let body = {
      tentti: event.value.toUpperCase(),
    }
    try {
      let result = await Axios.put(path + "tentti/"+id,body)
      dispatch({type:"TENTTI_NIMETTY", data:{newTenttiNimi: body.tentti, tenttiIndex: aktiivinenTentti}})
    } catch (exception) {
      console.log(exception)
    }
  }

  const muutaKysymys = async(event,props,kysymysIndex) => {
    let id = props.data.kysymykset[kysymysIndex].kysymysid
    let body = {
      kysymys: event.value,
      kysymys_aihe_id: props.data.kysymykset[kysymysIndex].kysymys_aihe_id
    } 
    try {
      let result = await Axios.put(path + "kysymys/"+id,body)
      props.dispatch({ type: "KYSYMYS_NIMETTY", 
        data: {kysymys: body.kysymys, tenttiIndex: props.tenttiIndex, kyIndex: kysymysIndex} })
    } catch (exception) {
      console.log(exception)
    }
  }
  
  const muutaVaihtoehtoTeksti = async(event,props,veIndex) => {
    let id = props.data.vaihtoehdot[veIndex].vaihtoehtoid
    let body = {
      vaihtoehto: event.value,
      korrekti: props.data.vaihtoehdot[veIndex].korrekti,
      vaihtoehto_kysymys_id: props.data.kysymysid
    } 
    try {
      let result = await Axios.put(path + "vaihtoehto/"+id,body)
      props.dispatch({ type: "VAIHTOEHTO_NIMETTY", 
        data: { vaihtoehto: body.vaihtoehto, tenttiIndex: props.tenttiIndex, kyIndex: props.kysymysIndex, veIndex: veIndex } })
    } catch (exception) {
      console.log(exception)
    }
  }

  const muutaVaihtoehtoArvo = async(event,props,veIndex) => {
    let id = props.data.vaihtoehdot[veIndex].vaihtoehtoid
    let body = {
      vaihtoehto: props.data.vaihtoehdot[veIndex].vaihtoehto,
      korrekti: event.target.checked,
      vaihtoehto_kysymys_id: props.data.kysymysid
    } 
    try {
      let result = await Axios.put(path + "vaihtoehto/"+id,body)
      props.dispatch({ type: "OIKEA_VAIHDETTU", 
        data: { korrekti: body.korrekti, tenttiIndex: props.tenttiIndex, kyIndex: props.kysymysIndex, veIndex: veIndex } })
    } catch (exception) {
      console.log(exception)
    }
  }

  const vastausAnnettu = async(event,props,veIndex) => {
    let kayttajaid = "8"
    let vastausid = "0"
    let body = {
      vastaus: event.target.checked,
      vastauspvm: new Date(Date.now()).toISOString(),
      vastaus_vaihtoehto_id: props.data.vaihtoehdot[veIndex].vaihtoehtoid,
      vastaus_kayttaja_id: kayttajaid,
      vastaus_tentti_id: props.tenttiid
    }
    try {
      if (body.vastaus) {
        let result = await Axios.post(path + "vastaus",body)
      } else {
        let result2 = await Axios.get(path + "kayttaja/"+kayttajaid+"/tentti/"+props.tenttiid+"/vaihtoehto/"+body.vastaus_vaihtoehto_id)
        vastausid = result2.data[0].vastausid
        let poistoresult = await Axios.delete(path + "vastaus/"+vastausid)
      }
    } catch (exception) {
        console.log(exception)
    }
    props.dispatch({type: "VASTAUS_VAIHDETTU", 
      data:{valittu: body.vastaus, tenttiIndex: props.tenttiIndex, kyIndex: props.kysymysIndex, veIndex: veIndex} })
  }
  
  const lisaaTentti = async(dispatch,uusiTenttiNimi,aktiivinenKurssi,aktiivinenKayttaja) => {

    let body = {
      tentti: uusiTenttiNimi
    }
    try {
      let result = await Axios.post(path + "tentti",body)
      let tenttiId = result.data[0].tenttiid
      let body2 = {
        kurssi_kurssi_id: aktiivinenKurssi,
        kurssi_tentti_id: tenttiId
      }
      let body3 = {
        tkasittelija_kayttaja_id : aktiivinenKayttaja,
        tkasittelija_tentti_id: tenttiId,
        pistemaara: null,
        tenttialoituspvm: null
      }
      let result2 = await Axios.post(path + "kurssitentti",body2)
      let uusiTentti = {
        tenttiid: tenttiId,
        tentti: body.tentti,
        kysymykset: []
      }
      let result3 = await Axios.post(path + "tenttikasittelija",body3)
      dispatch({type: "TENTTI_LISATTY", data:{lisays: uusiTentti}})
    } catch (exception) {
      console.log(exception)
    }    
  }
  
  const lisaaKysymys = async(props) => {
    let body = {
      kysymys: "",
      kysymys_aihe_id: 0
    } 
    try {
      let result = await Axios.post(path + "kysymys",body)
      let id = result.data[0].kysymysid
      let body2 = {
        tkysymys_kysymys_id: id,
        tkysymys_tentti_id: props.data.tenttiid
      }
      let result2 = await Axios.post(path + "tenttikysymys",body2)
      props.dispatch({type: "KYSYMYS_LISATTY", 
        data:{tenttiIndex: props.tenttiIndex, kysymysid: body2.tkysymys_kysymys_id}})
    } catch (exception) {
      console.log(exception)
    }
  }

  const lisaaVaihtoehto = async(props) => {
     let body = {
      vaihtoehto: "",
      korrekti: false,
      vaihtoehto_kysymys_id: props.data.kysymysid
    } 
    try {
      let result = await Axios.post(path + "vaihtoehto/kysymys/"+props.data.kysymysid,body)
      let vaihtoehtoid = result.data[0].vaihtoehtoid
      props.dispatch({type: "VAIHTOEHTO_LISATTY", 
        data:{tenttiIndex: props.tenttiIndex, kyIndex: props.kysymysIndex, vaihtoehtoid: vaihtoehtoid} })
    } catch (exception) {
      console.log(exception)
    }
  }

  const poistaTenttiKurssilta = async(dispatch, data, index, kurssiid) => {
    let tenttiid = data.tenttiid
    try {
      let result = await Axios.delete(path + "kurssitentti/"+tenttiid+"/kurssi/"+kurssiid)
      dispatch({type: "TENTTI_POISTETTU", 
        data:{ tenttiIndex: index} })
    } catch (exception) {
      console.log(exception)
    }
  }  

  const poistaKysymysTentilta = async(dispatch, data, kysymysIndex, aktiivinenTentti) => {
    let kysymysid = data.kysymykset[kysymysIndex].kysymysid
    let tenttiid = data.tenttiid
    try {
      let result = await Axios.delete(path + "tenttikysymys/"+kysymysid+"/tentti/"+tenttiid)
      dispatch({type: "KYSYMYS_POISTETTU", 
        data:{ tenttiIndex: aktiivinenTentti, kyIndex: kysymysIndex } })
    } catch (exception) {
      console.log(exception)
    }
  }

  const poistaVaihtoehto = async(dispatch, data, veIndex, kysymysIndex, aktiivinenTentti) => {
    let id = data.kysymykset[kysymysIndex].vaihtoehdot[veIndex].vaihtoehtoid
    try {
      let result = await Axios.delete(path + "vaihtoehto/"+id)
      dispatch({type: "VAIHTOEHTO_POISTETTU", 
        data:{ tenttiIndex: aktiivinenTentti, kyIndex: kysymysIndex, veIndex: veIndex }})
    } catch (exception) {
      console.log(exception)
    }
  }

  export {

    fetchKurssinData,
    fetchKurssit,
    fetchTentit,
    muutaTentti,
    muutaKysymys,
    muutaVaihtoehtoTeksti,
    muutaVaihtoehtoArvo,
    vastausAnnettu,
    lisaaTentti,
    lisaaKysymys,
    lisaaVaihtoehto,
    poistaTenttiKurssilta,
    poistaKysymysTentilta,
    poistaVaihtoehto
  }
  
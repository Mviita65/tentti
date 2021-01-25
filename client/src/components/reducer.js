//UI-softan tilahallinta tänne
function reducer(state, action) {
    let syväKopio = JSON.parse(JSON.stringify(state))
    switch (action.type) {      
      case "INIT_DATA":
        return action.data
      case "KYSYMYS_NIMETTY":
        syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].kysymys = action.data.kysymys
        return syväKopio
      case "KYSYMYS_POISTETTU":
        syväKopio[action.data.tenttiIndex].kysymykset.splice(action.data.kyIndex,1)
        return syväKopio
      case "KYSYMYS_LISATTY":
        let uusiKysymys = {
          kysymysid: action.data.kysymysid,
          kysymys: "",
          kysymys_aihe_id: 0,
          vaihtoehdot: []
        }
        let uudetKysymykset = syväKopio[action.data.tenttiIndex].kysymykset.concat(uusiKysymys)
        syväKopio[action.data.tenttiIndex].kysymykset = uudetKysymykset
        return syväKopio
      case "TENTTI_NIMETTY":
        syväKopio[action.data.tenttiIndex].tentti = action.data.newTenttiNimi.toUpperCase();
        return syväKopio
      case "TENTTI_POISTETTU":
        syväKopio.splice(action.data.tenttiIndex,1)
        return syväKopio
      case "TENTTI_LISATTY":
        let uudetTentit = syväKopio.concat(action.data.lisays)
        syväKopio = uudetTentit
        return syväKopio    
      case "VAIHTOEHTO_NIMETTY":
        syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].vaihtoehdot[action.data.veIndex].vaihtoehto = action.data.vaihtoehto
        return syväKopio
      case "VAIHTOEHTO_POISTETTU":
        syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].vaihtoehdot.splice(action.data.veIndex,1)
        return syväKopio
      case "VAIHTOEHTO_LISATTY":
        let uusiVaihtoehto = {
          vaihtoehtoid: action.data.vaihtoehtoid,
          vaihtoehto: "",
          valittu: false,
          korrekti: false
        }
        let uudetVaihtoehdot = syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].vaihtoehdot.concat(uusiVaihtoehto)
        syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].vaihtoehdot = uudetVaihtoehdot
        return syväKopio
      case "VASTAUS_VAIHDETTU":
        syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].vaihtoehdot[action.data.veIndex].valittu = action.data.valittu
        return syväKopio
      case "OIKEA_VAIHDETTU":
        syväKopio[action.data.tenttiIndex].kysymykset[action.data.kyIndex].vaihtoehdot[action.data.veIndex].korrekti = action.data.korrekti
        return syväKopio
      default:
        throw new Error();
    }
  }

  export default reducer
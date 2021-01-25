import Axios from 'axios';
import '../oma.css';
import React, { useEffect } from 'react';
import strings from './merkkijonot';


const Tenttivalikko = ({tenttiData,setTenttiData,setAktiivinenTentti,aktiivinenTentti,setAktiivinenKurssi,aktiivinenKurssi,setKurssiDataIndex,kurssiData,lang}) => {

  const fetchTenttiData = async () => {
    try {
      let tenttitiedot = []
      let result = await Axios.get("http://localhost:4000/tentti")
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

  useEffect(fetchTenttiData) 



  return (
    <div className="grid-item">{strings.tenttivalinta}
        {tenttiData.map((item, index) =>
            <div key={index} className="kysymys">
                <span className="t-nav-item" onClick={() =>{
                //  setAktiivinenKurssi(item.kurssiid)
                //  setAktiivinenTentti(item.tenttiid)
            }}>{item.tentti} ({item.kurssi})</span> <br/>
              <span className="vastaus"> ● {item.julkaisupvm}, {strings.minimi} {item.minimipisteet}p., {item.etunimi} {item.sukunimi}</span>
            </div>
        )}
    </div>
  )
}

export default Tenttivalikko
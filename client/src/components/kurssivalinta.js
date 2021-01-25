import Axios from 'axios';
import '../oma.css';
import React, { useEffect } from 'react';
import strings from './merkkijonot';

const Kurssivalikko = ({
  aktiivinenKurssi,setAktiivinenKurssi,
  kurssiData,setKurssiData,
  kurssiDataIndex,setKurssiDataIndex,
  tentit,setTentit,lang}) => {

  const fetchKurssiData = async () => {
    try {
      let kurssitiedot = []
      let result = await Axios.get("http://localhost:4000/kurssi")
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

  useEffect(fetchKurssiData)

  return (
    <div className="grid-item">{strings.kurssivalinta}
        {kurssiData.map((item, index) =>
            <div key={item.kurssiid} className="kysymys">
                <span className="t-nav-item" onClick={() =>{
                    setAktiivinenKurssi(item.kurssiid); // valitun kurssin tenttien tietojen hakua varten
                    setKurssiDataIndex(index) // valitun kurssin tietoja varten 
                    setTentit(1);     // tenttinäyttö päälle kurssin valinnan jälkeen
                }}>{item.kurssi} ● {item.aloituspvm}
                </span>
            </div>
        )}
    </div>
  )
}

export default Kurssivalikko
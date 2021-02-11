import '../oma.css';
import React, { useEffect } from 'react';
import { fetchKurssinData,fetchKurssit } from './dataManipulation.js'

const Kurssivalikko = ({
  path,dispatch,aktiivinenKayttaja,
  aktiivinenKurssi,setAktiivinenKurssi,
  kurssiData,setKurssiData,
  kurssiDataIndex,setKurssiDataIndex,
  tentit,setTentit,headers
  }) => {

  // kurssit haetaan jo app.js hookissa 
  // useEffect(() => {
  //   fetchKurssit(kurssiData,setKurssiData,headers);
  // },[])


  return (
    <div className="content">
        {kurssiData.map((item, index) =>
            <div key={item.kurssiid} className="kysymys">
                <span className="t-nav-item" onClick={() =>{
                    fetchKurssinData(dispatch,item.kurssiid,aktiivinenKayttaja,path,headers)
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
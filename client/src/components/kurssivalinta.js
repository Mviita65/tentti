import '../oma.css';
import React, { useEffect } from 'react';
import strings from './merkkijonot';
import { fetchKurssinData,fetchKurssit } from './dataManipulation.js'

const Kurssivalikko = ({
  path,dispatch,aktiivinenKayttaja,
  aktiivinenKurssi,setAktiivinenKurssi,
  kurssiData,setKurssiData,
  kurssiDataIndex,setKurssiDataIndex,
  tentit,setTentit}) => {

  useEffect(() => {
    fetchKurssit(kurssiData,setKurssiData);
  },[])


  return (
    <div className="grid-item">{strings.kurssivalinta}
        {kurssiData.map((item, index) =>
            <div key={item.kurssiid} className="kysymys">
                <span className="t-nav-item" onClick={() =>{
                    fetchKurssinData(dispatch,item.kurssiid,aktiivinenKayttaja,path)
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
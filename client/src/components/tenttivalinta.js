import '../oma.css';
import React, { useEffect } from 'react';
import strings from './merkkijonot';
import {fetchTenttiData} from './dataManipulation.js'


const Tenttivalikko = ({tenttiData,setTenttiData,setAktiivinenTentti,aktiivinenTentti,tentit,setTentit,setAktiivinenKurssi,aktiivinenKurssi,setKurssiDataIndex,kurssiData,setKurssiData}) => {

  useEffect(() => {
    fetchTenttiData(tenttiData,setTenttiData) 
  },[])

  return (
    <div className="grid-item">{strings.tenttivalinta}
        {tenttiData.map((item, index) =>
            <div key={index} className="kysymys">
                <span className="t-nav-item" onClick={() =>{
                  setAktiivinenKurssi(item.kurssiid)
                  
                  for (let i=0; i < kurssiData.length; i++){
                    if (kurssiData[i].kurssiid === item.kurssiid){
                      setKurssiDataIndex(i)
                      // let kurssinTentit = tenttiData.filter(tentti => tentti.kurssiid === item.kurssiid)
                      // console.log (kurssinTentit)
                      // for (let j=0; j < kurssinTentit.length; j++){
                      //   if (kurssinTentit[j].tenttiid === item.tenttiid){
                      //     setAktiivinenTentti(j)
                      //   }
                      // }
                    }; 
                  }
                  setTentit(1)
            }}>{item.tentti} ({item.kurssi})</span> <br/>
              <span className="vastaus"> ● {item.julkaisupvm}, {strings.minimi} {item.minimipisteet}p., {item.etunimi} {item.sukunimi}</span>
            </div>
        )}
    </div>
  )
}

export default Tenttivalikko
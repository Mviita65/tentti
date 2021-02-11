import '../oma.css';
import React, { useEffect } from 'react';
import strings from './merkkijonot';
import {fetchKurssinData,fetchTentit} from './dataManipulation.js'


const Tenttivalikko = ({
    path,dispatch,aktiivinenKayttaja,
    tenttiData,setTenttiData,
    setAktiivinenTentti,aktiivinenTentti,
    tentit,setTentit,
    setAktiivinenKurssi,aktiivinenKurssi,
    setKurssiDataIndex,
    kurssiData,setKurssiData,
    headers}) => {

  useEffect(() => {
    fetchTentit(tenttiData,setTenttiData,headers) 
  },[])

  return (
        <div className="content">
        {tenttiData.map((item, index) =>
            <div key={index} className="kysymys">
                <span className="t-nav-item" onClick={() =>{
                  fetchKurssinData(dispatch,item.kurssiid,aktiivinenKayttaja,path,headers)
                  setAktiivinenKurssi(item.kurssiid)
                  for (let i=0; i < kurssiData.length; i++){
                    if (kurssiData[i].kurssiid === item.kurssiid){
                      setKurssiDataIndex(i)
                    }
                  }
                  // let kurssinTentit = tenttiData.filter(tentti => tentti.kurssiid === item.kurssiid)
                  // console.log(kurssinTentit)
                  // for (let j=0; j < kurssinTentit.length; j++){
                  //   if (kurssinTentit[j].tenttiid === item.tenttiid){
                  //     setAktiivinenTentti(j)
                  //   }
                  // }       
                  setTentit(1)
            }}>{item.tentti} ({item.kurssi})</span> <br/>
              <span className="vastaus"> ● {item.julkaisupvm}, {strings.minimi} {item.minimipisteet}p., {item.etunimi} {item.sukunimi}</span>
            </div>
        )}
        </div>
  )
}

export default Tenttivalikko
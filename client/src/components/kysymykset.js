import {
    muutaKysymys,
    lisaaKysymys
  } from './dataManipulation.js';
import Vaihtoehdot from './vaihtoehdot.js';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import strings from './merkkijonot';

function Kysymykset(props) {  //näytölle tentin kysymykset ja kutsuu Vaihtoehdot näyttämään kysymysten vaihtoehdot

     return <section>
      {props.hallinta? props.data.kysymykset.map((item, kysymysIndex) =>    // jos hallinta valittu, niin
        <div key={item.kysymysid} className="kysymys">                     {/*  kysymystä voidaan muotoilla */}
          <input type="text" defaultValue={item.kysymys} id={item.kysymysid} onBlur={(event) => {
              var newText = document.getElementById(item.kysymysid);
              muutaKysymys(newText,props,kysymysIndex)}}>
          </input> <button className="delButton" onClick={()=>{             // kysymys voidaan poistaa
                      props.setVahvistusOtsikko(strings.kpoisto);
                      props.setVahvistusTeksti(`${strings.kvahvistus} (${props.data.kysymykset[kysymysIndex].kysymys})?`); 
                      props.setVahvistusTehtava("poistaKysymysTentilta"); 
                      props.setVahvistusPoisto(kysymysIndex); 
                      props.setVahvistusPoisto2(""); 
                      props.setVahvista(true);
          }}><DeleteTwoToneIcon /></button>
          {/* <Vaihtoehdot props={muunnaPropsit(kysymysIndex)}/> */}
          {/* <Vaihtoehdot props={{...props, tenttiid : props.data.tenttiid, kysymysIndex : kysymysIndex}} data={props.data.kysymykset[kysymysIndex]}/> */}
          <Vaihtoehdot dispatch={props.dispatch} tenttiIndex={props.tenttiIndex} tenttiid={props.data.tenttiid}
              kysymysIndex={kysymysIndex} data={props.data.kysymykset[kysymysIndex]} 
              setVastaukset={props.setVastaukset} vastaukset={props.vastaukset}  
              setHallinta={props.setHallinta} hallinta={props.hallinta}  
              setVahvista={props.setVahvista} vahvista={props.vahvista} 
              setVahvistusOtsikko={props.setVahvistusOtsikko} vahvistusOtsikko={props.vahvistusOtsikko} 
              setVahvistusTeksti={props.setVahvistusTeksti} vahvistusTeksti={props.vahvistusTeksti}  
              setVahvistusTehtava={props.setVahvistusTehtava} vahvistusTehtava={props.vahvistusTehtava} 
              setVahvistusPoisto={props.setVahvistusPoisto} vahvistusPoisto={props.vahvistusPoisto} 
              setVahvistusPoisto2={props.setVahvistusPoisto2} vahvistusPoisto2={props.vahvistusPoisto2}/> 
        </div>):                                                          // tentti menossa
        props.data.kysymykset.map((item, kysymysIndex) =>
          <div key={item.kysymysid} className="kysymys">{item.kysymys} 
            {/* <Vaihtoehdot props={muunnaPropsit(kysymysIndex)}/> */}
            {/* <Vaihtoehdot props={{...props, tenttiid : props.data.tenttiid, kysymysIndex : kysymysIndex}} data={props.data.kysymykset[kysymysIndex]}/> */}
            <Vaihtoehdot dispatch={props.dispatch} tenttiIndex={props.tenttiIndex} tenttiid={props.data.tenttiid}
              kysymysIndex={kysymysIndex} data={props.data.kysymykset[kysymysIndex]} 
              setVastaukset={props.setVastaukset} vastaukset={props.vastaukset}  
              setHallinta={props.setHallinta} hallinta={props.hallinta}  
              setVahvista={props.setVahvista} vahvista={props.vahvista} 
              setVahvistusOtsikko={props.setVahvistusOtsikko} vahvistusOtsikko={props.vahvistusOtsikko} 
              setVahvistusTeksti={props.setVahvistusTeksti} vahvistusTeksti={props.vahvistusTeksti}  
              setVahvistusTehtava={props.setVahvistusTehtava} vahvistusTehtava={props.vahvistusTehtava} 
              setVahvistusPoisto={props.setVahvistusPoisto} vahvistusPoisto={props.vahvistusPoisto} 
              setVahvistusPoisto2={props.setVahvistusPoisto2} vahvistusPoisto2={props.vahvistusPoisto2}/>
      </div>)}
      {props.hallinta ? <div className="add"><span className="add-item" onClick={()=>{  // jos hallintatila, voi lisätä uuden kysymyksen
        lisaaKysymys(props)}}> + </span>
      </div> : ""}
      <div>
        {props.hallinta ? "" : <div className="alavalinta"><button className="button" onClick={()=>  // jos tentti menossa, voi valita tai piilottaa oikeiden vastausten näytön
          props.setVastaukset(!props.vastaukset)}>{strings.oikeat}</button> <button className="button" onClick={()=>{ // jos tentti menossa, voi valita tai piilottaa oikeiden vastausten näytön
            props.setKaaviot(1)}}>{strings.kaaviot}</button></div> }
      </div>
    </section>
  }

  export default Kysymykset
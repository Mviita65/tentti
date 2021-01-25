import {
    muutaKysymys,
    lisaaKysymys,
    poistaKysymysTentilta,
  } from './dataManipulation.js';
import Vaihtoehdot from './vaihtoehdot.js';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import ConfirmDialog from './confirmDialog.js';
import strings from './merkkijonot';

function Kysymykset(props) {  //näytölle tentin kysymykset ja kutsuu Vaihtoehdot näyttämään kysymysten vaihtoehdot

    return <section>
      {props.hallinta && !props.vahvista ? props.data.kysymykset.map((item, kysymysIndex) =>     // jos hallinta valittu
        <div key={item.kysymysid} className="kysymys">
          {/* <input type="text" value={item.kysymys} onChange={(event) =>{       // kysymystä voidaan muotoilla */}
          <input type="text" defaultValue={item.kysymys} id={item.kysymysid} onBlur={(event) => {
              var newText = document.getElementById(item.kysymysid);
              muutaKysymys(newText,props,kysymysIndex)}}>
          </input> <button className="delButton" onClick={()=>{               // kysymys voidaan poistaa
            // if (window.confirm(`${strings.kvahvistus} (${props.data.kysymykset[kysymysIndex].kysymys})?`)){
            //   poistaKysymysTentilta(props,kysymysIndex)
            // }
            props.setVahvista(true);props.setVahvistusOtsikko(strings.kpoisto);props.setVahvistusTeksti(`${strings.kvahvistus} (${props.data.kysymykset[kysymysIndex].kysymys})?`); props.setVahvistusTehtava("poistaKysymysTentilta"); props.setVahvistusPoisto(kysymysIndex);
          }}><DeleteTwoToneIcon /></button> 
          <Vaihtoehdot dispatch={props.dispatch} tenttiIndex={props.tenttiIndex} tenttiid={props.data.tenttiid} kysymysIndex={kysymysIndex} data={props.data.kysymykset[kysymysIndex]} vastaukset={props.vastaukset} setVastaukset={props.setVastaukset} hallinta={props.hallinta} setHallinta={props.setHallinta} setVahvista={props.setVahvista} vahvista={props.vahvista} setVahvistusOtsikko={props.setVahvistusOtsikko}  vahvistusOtsikko={props.vahvistusOtsikko} setVahvistusTeksti={props.setVahvistusTeksti} vahvistusTeksti={props.vahvistusTeksti} setVahvistusTehtava={props.setVahvistusTehtava} vahvistusTehtava={props.vahvistusTehtava} setVahvistusPoisto={props.setVahvistusPoisto} vahvistusPoisto={props.vahvistusPoisto}
          />
        </div>): 
        props.vahvista ? 
        <ConfirmDialog otsikko={props.vahvistusOtsikko} teksti={props.vahvistusTeksti} vahvista={props.vahvista} setVahvista={props.setVahvista} onConfirmAction={props.vahvistusTehtava} dispatch={props.dispatch} tenttiIndex={props.tenttiIndex} data={props.data} index={props.vahvistusPoisto} index2={""}/> :                                                            // tentti menossa
        props.data.kysymykset.map((item, kysymysIndex) =>
          <div key={item.kysymysid} className="kysymys">{item.kysymys}
          <Vaihtoehdot dispatch={props.dispatch} tenttiIndex={props.tenttiIndex} tenttiid={props.data.tenttiid} kysymysIndex={kysymysIndex} data={props.data.kysymykset[kysymysIndex]} vastaukset={props.vastaukset} setVastaukset={props.setVastaukset} hallinta={props.hallinta} setHallinta={props.setHallinta} setVahvista={props.setVahvista} vahvista={props.vahvista} setVahvistusOtsikko={props.setVahvistusOtsikko}  vahvistusOtsikko={props.vahvistusOtsikko} setVahvistusTeksti={props.setVahvistusTeksti} vahvistusTeksti={props.vahvistusTeksti} setVahvistusTehtava={props.setVahvistusTehtava} vahvistusTehtava={props.vahvistusTehtava} setVahvistusPoisto={props.setVahvistusPoisto} vahvistusPoisto={props.vahvistusPoisto}
          />
      </div>)}
      {props.hallinta ? <div className="add"><span className="add-item" onClick={()=>{
          // jos hallintatila, voi lisätä uuden kysymyksen
        lisaaKysymys(props)}}> + </span>
      </div> : ""}
      <div>
        {props.hallinta ? "" : <div className="alavalinta"><button className="button" onClick={()=>         // jos tentti menossa, voi valita tai piilottaa oikeiden vastausten näytön
          props.setVastaukset(!props.vastaukset)}>{strings.oikeat}</button> <button className="button" onClick={()=>{         // jos tentti menossa, voi valita tai piilottaa oikeiden vastausten näytön
            props.setKaaviot(1)}}>{strings.kaaviot}</button></div> }
      </div>
    </section>
  }

  export default Kysymykset
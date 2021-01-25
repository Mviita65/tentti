import {
    muutaVaihtoehtoTeksti,
    muutaVaihtoehtoArvo,
    vastausAnnettu,
    lisaaVaihtoehto
  } from './dataManipulation.js'
import cathead from './img/cathead.jpg'
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import ConfirmDialog from './confirmDialog.js';
import strings from './merkkijonot';


function Vaihtoehdot(props) { // näytölle kysymysten vaihtoehdot ja reagointi jos merkitään vastaukseksi

    return <section>
        {props.hallinta && !props.vahvista ? props.data.vaihtoehdot.map((item, veIndex) =>           // jos hallinta valittu
          <div key={item.vaihtoehtoid} className="vastaus">
            <input type="checkbox" checked={item.korrekti} onChange={(event) => { // voidaan muuttaa mikä on oikea vaihtoehto
                muutaVaihtoehtoArvo(event,props,veIndex)}}></input>
            {/* <input type="text" value={item.vaihtoehto} onChange={(event) =>{          // voidaan muotoilla vaihtoehdon tekstiä */}
             <input type="text" defaultValue={item.vaihtoehto} id={item.vaihtoehtoid} onBlur={(event) => {
              var newText = document.getElementById(item.vaihtoehtoid);
              muutaVaihtoehtoTeksti(newText, props, veIndex);
            }}> 
            </input> <button className="delButton" onClick={()=>{                 // voidaan poistaa vaihtoehto
              // if (window.confirm("Poistetaanko vaihtoehto ("+props.data.vaihtoehdot[veIndex].vaihtoehto+")?")){
              //   poistaVaihtoehto(props,veIndex)
              // }
              props.setVahvistusOtsikko(strings.vpoisto);props.setVahvistusTeksti(`${strings.vvahvistus} (${props.data.vaihtoehdot[veIndex].vaihtoehto})?`);props.setVahvistusTehtava("poistaVaihtoehto");props.setVahvistusPoisto(veIndex);props.setVahvista(true)
            }}><DeleteTwoToneIcon /></button> {!props.hallinta && item.valittu && item.korrekti ? <img alt="cathead" src={cathead}/> : ""}
          </div>): 
          props.vahvista ? 
          <ConfirmDialog otsikko={props.vahvistusOtsikko} teksti={props.vahvistusTeksti} vahvista={props.vahvista} setVahvista={props.setVahvista} onConfirmAction={props.vahvistusTehtava} dispatch={props.dispatch} kysymysIndex={props.kysymysIndex} data={props.data} index={props.vahvistusPoisto} index2={""}/> :                                                                // muu kuin hallintatila
          props.vastaukset ? props.data.vaihtoehdot.map((item, veIndex) =>        // oikeiden vastausten näyttö valittu: valintoja ei voi muuttaa 
            <div key={item.vaihtoehtoid} className="vastaus">
              <input type="checkbox" checked={item.valittu} readOnly></input>            
              <input type="checkbox" checked={item.korrekti} readOnly></input>
              {item.vaihtoehto} {item.valittu && item.korrekti ? <img alt="cathead" src={cathead}/> : ""}
            </div>) :
            props.data.vaihtoehdot.map((item, veIndex) =>                         // tentti menossa (vastaukset poissa)
              <div key={item.vaihtoehtoid} className="vastaus">
                <input type="checkbox" checked={item.valittu} onChange={(event) => {  // vaihtoehto voidaan valita vastaukseksi tai poistaa
                  vastausAnnettu(event,props,veIndex)}}>
                </input> {item.vaihtoehto}
              </div>)}
            {props.hallinta ? <div className="add"><span className="add-ve" onClick={()=>{  // jos hallintatila, voi lisätä uuden vaihtoehdon
              lisaaVaihtoehto(props)}}> + </span></div> : ""}
      </section>
    }

    export default Vaihtoehdot
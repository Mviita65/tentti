import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { 
  poistaKysymysTentilta, 
  poistaTenttiKurssilta,
  poistaVaihtoehto
} from './dataManipulation';
import '../oma.css';
import strings from './merkkijonot';


const ConfirmDialog = (props) => {
  const { otsikko, teksti, vahvista, setVahvista, onConfirmAction, dispatch, data, index, index2 } = props;
  return (
    <Dialog
      open={vahvista}
      onClose={() => setVahvista(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{otsikko}</DialogTitle>
      <DialogContent>{teksti}</DialogContent>
      <DialogActions>
        <button 
          className="button"
          // variant="contained"
          onClick={() => {
            switch (onConfirmAction) {
              case "poistaTenttiKurssilta" :  
                poistaTenttiKurssilta(dispatch, data, index, index2)
                setVahvista(false)
                return
              case "poistaKysymysTentilta" :
                poistaKysymysTentilta(props, index)
                setVahvista(false)
                return
              case "poistaVaihtoehto" :
                poistaVaihtoehto(props, index)
                setVahvista(false)
                return
              default : throw new Error();
            }
          }}
          // color="default"
        >
          OK
        </button>
        <button
          className="button" 
          // variant="contained"
          onClick={() => setVahvista(false)}
          // color="secondary"
        >
          {strings.peruuta}
        </button>
      </DialogActions>
    </Dialog>
  );
};export default ConfirmDialog;
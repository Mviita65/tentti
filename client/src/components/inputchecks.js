
function tarkistaSähköposti(email) {
    if (email === undefined) {
        throw new Error('Sähköpostia ei välitetty, tarkista lomake!');
    }
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

function tarkistaSalasana(str){
    // at least one number, one lowercase and one uppercase letter
    // at least six characters
    if (str === undefined) {
        throw new Error('Salasanaa ei välitetty, tarkista lomake!');
    }var res = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return res.test(str);
  }

  module.exports = {
      tarkistaSähköposti, tarkistaSalasana
  }
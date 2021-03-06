import React, {useState} from 'react';
import cathead from './img/cathead.jpg';
import strings from './merkkijonot';
import {tarkistaSahkoposti,tarkistaSalasana} from './inputchecks.js';

const Register = ({luoTunnus,register,setRegister, setAktiivinenKayttaja}) => {
    
    const [firstname, setFirstname] = useState("");
    const [surename, setSurename] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [verify, setVerify] = useState("");
    const [valinta,setValinta] = useState(false);
    const [role, setRole] = useState("");
    const [viesti, setViesti] = useState("");
    
    const evaluate =async(e) => {
        e.preventDefault()

        setRole("oppilas")
        if (valinta) {
            setRole("opettaja")
        }

        if (tarkistaSahkoposti(username)) {
            if (tarkistaSalasana(password)) {
     
                if(password === verify) {

                    const uusiKayttaja = 
                    {
                        firstname : firstname,
                        surename : surename,
                        username : username,
                        password : password,
                        role : role
                    }

                    luoTunnus(e, uusiKayttaja, setRegister, setAktiivinenKayttaja);
                }
            } else {
                setViesti(strings.salasanamuoto)
            }
        } else {
            setViesti(strings.sähköpostimuoto)
        }
    }
    
    return (
        <div className="content"><br/>
        <section className="kysymys">
            {strings.rekisteröidy}
                    <br></br>
        <form className="vastaus" onSubmit={e => evaluate(e)}>
            {strings.etunimi}<br/> <input onChange={e=> setFirstname(e.target.value)} value={firstname}/> 
            <br/>{strings.sukunimi}<br/> <input onChange={e=> setSurename(e.target.value)} value={surename}/>
            <br/>{strings.sähköposti}<br/> <input onChange={e=> setUsername(e.target.value)} value={username} required/> 
            <br/>{strings.salasana}<br/> <input onChange={e=> setPassword(e.target.value)} type="password" value={password} required />
            <br/>{strings.uudelleen}<br/> <input onChange={e=> setVerify(e.target.value)} type="password" value={verify} required/> {password!=="" && password===verify && tarkistaSalasana(password)? <img alt="cathead" src={cathead}/> : ""}
            <br/>{strings.opettaja} <input type="checkbox" onChange={e=> setValinta(e.target.checked)} value={valinta}/>
            <br/><br/><input className="button" type="submit" value={strings.lähetä}/> <button className="button" onClick={e=>setRegister(false)}>{strings.paluu}</button><br/>
        </form>
        </section>
        <section className="kysymys">{viesti}</section>
        </div>
    )}



export default Register;
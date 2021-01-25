import React, {useState} from 'react';
import strings from './merkkijonot';

const Login = ({handleSubmit,register,setRegister}) => {
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const doSubmit =async(e) => {
        e.preventDefault()
        const userdata = 
            {
                username : username,
                password : password
            };

        handleSubmit(e, userdata);
    }
    
    return (
        <div className="grid-item"><br/>
        <section className="kysymys">
            {strings.kirjaudu}
        <br/>
        <form className="vastaus" onSubmit={e => doSubmit(e)}>
            {strings.sähköposti}<br/><input onChange={e=> setUsername(e.target.value)} value={username} required/> 
            <br/>{strings.salasana}<br/><input onChange={e=> setPassword(e.target.value)} type="password" value={password} required />
            <br/><br/><input className="button" type="submit" value={strings.lähetä}/><br/>
        </form>
        </section>
        <section className="kysymys">
            {strings.rekisteröidy}
        <br/>
        <div className="vastaus">
            {strings.rekisteröimätön}<br/><br/>
            <button className="button" onClick={e => {setRegister(true)}}>
            {strings.luo}</button><br/>
        </div>
        </section>
        </div>
    )}


export default Login;
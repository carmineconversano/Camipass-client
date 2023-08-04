import React, {createContext, useContext, useState} from "react";
import {User} from "../services/user";
import swal from "sweetalert2";
import {parseJwt} from "../components/utils";
import Cookies from 'js-cookie';

const {REACT_APP_COOKIENAME} = process.env;

const authContext = createContext({
    user: null
});

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({children}) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
    const getUser = () => {
        let jwt = Cookies.get(REACT_APP_COOKIENAME);
        if (jwt !== "") {
            return parseJwt(jwt);
        } else {
            return false;
        }
    }

    const [user, setUser] = useState(getUser);

    const setCookie = (jwt) => {
        Cookies.set(REACT_APP_COOKIENAME, jwt);
        setUser(getUser());
    }

    const removeCookie = () => {
        Cookies.remove(REACT_APP_COOKIENAME);
    }

    const signin = (email, password) => {
        let user = {
            email: email,
            password: password
        };
        return User.login(user)
            .then(response => {
                let user = parseJwt(response.data);
                swal.fire({
                    titleText: "Login effettuato!",
                    text: "Bentornatə! Ci eri mancatə :'(",
                    icon: "success",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                }).then((res) => {
                    setUser(user);
                    setCookie(response.data);
                    window.location = "/";
                });
                return user;
            }).catch(err => {
                if (err.response && err.response.status === 401)
                    swal.fire({
                        titleText: "Credenziali errate",
                        text: "L'email o la password non sono corretti.",
                        icon: "error",
                        background: "#393B41",
                        confirmButtonColor: '#F95F72'
                    });
                else swal.fire({
                    titleText: "Qualcosa è andato storto :-/",
                    text: "Aggiorna la pagina e riprova.",
                    icon: "error",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                });
            });
    };

    const signup = (username, email, password, color) => {
        let user = {
            username: username,
            email: email,
            password: password,
            color: color
        }
        return User.signup(user)
            .then(response => {
                let user = {
                    username: response.data.username,
                    color: response.data.color
                }
                swal.fire({
                    titleText: "Registrazione completata!",
                    text: "Benvenutə nel mondo Camipass!\nEffettua il login per iniziare.",
                    icon: "success",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                }).then(() => {
                    window.location = "/";
                });

                return user;
            }).catch(err => {
                if (err.response.status === 410)
                    swal.fire({
                        titleText: "Username già esistente",
                        text: "Qualcunə è arrivatə prima di te :-/",
                        icon: "error",
                        background: "#393B41",
                        confirmButtonColor: '#F95F72'
                    });
                else if (err.response.status === 411)
                    swal.fire({
                        title: "Email già esistente",
                        text: "L'indirizzo email è stato già usato. Prova a entrare con quella email.",
                        icon: "error",
                        background: "#393B41",
                        confirmButtonColor: '#F95F72'
                    });
                else swal.fire({
                        titleText: "Qualcosa è andato storto :-/",
                        text: "Aggiorna la pagina e riprova.",
                        icon: "error",
                        background: "#393B41",
                        confirmButtonColor: '#F95F72'
                    });
            });
    };

    const updateWpassword = (user, oldpw, newpw, jwt) => {
        User.validatePassword({password: oldpw}, jwt)
            .then(res => {
                user.password = newpw;
                updateUser(user, jwt);
            }).catch(err => {
            if (err.response.status === 400)
                swal.fire({
                    title: "Vecchia password non corretta",
                    text: "Inserisci correttamente la vecchia password.",
                    icon: "error",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                });
            else swal.fire({
                titleText: "Qualcosa è andato storto :-/",
                text: "Aggiorna la pagina e riprova.",
                icon: "error",
                background: "#393B41",
                confirmButtonColor: '#F95F72'
            });
        })
    }

    const validatePassword = (data) => {
        return User.validatePassword(data, Cookies.get(REACT_APP_COOKIENAME))
    };

    const updateUser = (user, jwt) => {
        User.update(user, user.id, jwt)
            .then(response => {
                let user = response.data;
                swal.fire({
                    titleText: "Dati aggiornati!",
                    text: "Effettua di nuovo il login per applicare le modifiche.",
                    icon: "success",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                }).then(() => {
                    signout();
                });

                return user;
            }).catch(err => {
            if (err.response.status === 410)
                swal.fire({
                    titleText: "Username già esistente",
                    text: "Qualcunə è arrivatə prima di te :-/",
                    icon: "error",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                });
            else if (err.response.status === 411)
                swal.fire({
                    title: "Email già esistente",
                    text: "L'indirizzo email è stato già usato. Prova a entrare con quella email.",
                    icon: "error",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                });
            else swal.fire({
                    titleText: "Qualcosa è andato storto :-/",
                    text: "Aggiorna la pagina e riprova.",
                    icon: "error",
                    background: "#393B41",
                    confirmButtonColor: '#F95F72'
                });
        });
    }

    const update = (id, username, email, cambiapassword, oldpassword, newpassword, color) => {
        let user = {
            id: id,
            username: username,
            email: email,
            color: color
        }
        let jwt = Cookies.get(REACT_APP_COOKIENAME);

        if (cambiapassword) updateWpassword(user, oldpassword, newpassword, jwt);
        else updateUser(user, jwt);
    };

    const signout = () => {

        return swal.fire({
            titleText: "Logout effettuato!",
            text: "Sempre a disposizione per servirti :)",
            icon: "success",
            background: "#393B41",
            confirmButtonColor: '#F95F72'
        }).then(() => {
            setUser(false);
            removeCookie();
            window.location = "/";
        });
    };

    // Return the user object and auth methods
    return {
        user,
        setUser,
        signin,
        signup,
        update,
        signout,
        getUser,
        validatePassword
    };
}

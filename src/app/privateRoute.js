import React from "react";
import {Redirect, Route} from "react-router-dom";
import {useAuth} from "./auth";
import swal from 'sweetalert2';

export default function PrivateRoute({children, ...rest}) {
    let auth = useAuth();

    if (!auth.user) {
        swal.fire({
            titleText: "Accesso negato!",
            text: "Per accedere a questa sezione devi aver effettuato il login",
            icon: "error",
            background: "#393B41",
            confirmButtonColor: '#F95F72'
        });
    }

    return (
        <Route
            {...rest}
            render={({location}) =>
                auth.user ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {from: location}
                        }}
                    />
                )
            }
        />
    );
}

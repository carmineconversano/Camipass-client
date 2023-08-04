import {Redirect, Route, Switch} from "react-router-dom";
import Home from "../pages/home";
import AuthLogin from "../pages/login/authLogin";
import AuthSignup from "../pages/signup/authSignup";
import PrivateRoute from "./privateRoute";
import Rooms from "../pages/rooms";
import React from "react";
import PageNotFound from "../pages/pagenotfound";
import AuthAccount from "../pages/account/authAccount";


export default class Routes extends React.Component {
    constructor(props) {
        super(props);
        this.props.auth.setUser(this.props.auth.getUser());
    }

    render() {
        return (
            <Switch>
                <Route exact path="/" component={Home} on/>
                <Route exact path="/login" component={AuthLogin}/>
                <Route exact path="/signup" component={AuthSignup}/>
                <PrivateRoute exact path="/rooms">
                    <Rooms/>
                </PrivateRoute>
                <PrivateRoute path="/account">
                    <AuthAccount/>
                </PrivateRoute>
                <Route path='/404' component={PageNotFound}/>
                <Redirect from='*' to='/404'/>
            </Switch>
        );
    }
}

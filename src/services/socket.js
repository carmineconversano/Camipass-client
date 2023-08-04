import io from "socket.io-client";
import Cookies from "js-cookie";

const {REACT_APP_SERVER_ADDRESS_WEBSOCKET} = process.env;
const {REACT_APP_COOKIENAME} = process.env;


export const socket = io(REACT_APP_SERVER_ADDRESS_WEBSOCKET, {
    path: '/socket.io',
    withCredentials: true,
    forceNew: false,
    reconnection: true,
    extraHeaders: {
        'x-auth-token': Cookies.get(REACT_APP_COOKIENAME)
    },
    transportOptions: {
        polling: {
            extraHeaders: {
                'x-auth-token': Cookies.get(REACT_APP_COOKIENAME)
            }
        }
    },
});

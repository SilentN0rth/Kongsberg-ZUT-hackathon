import type { Access } from "payload";

// Załoga (telefony) nie loguje się: czyta urządzenia i zgłoszenia oraz wysyła zgłoszenia przez kolejkę.
// Oficerowie mostka logują się do panelu i zmieniają statusy.
export const anyone: Access = () => true;
export const authenticated: Access = ({ req }) => Boolean(req.user);

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyALPwm2xepqpNgeoG04XLlwcLPJn6vJ0hI",
  authDomain: "chat-app-46957.firebaseapp.com",
  projectId: "chat-app-46957",
  storageBucket: "chat-app-46957.appspot.com",
  messagingSenderId: "465118467949",
  appId: "1:465118467949:web:9fb12560b44411c78f6c64",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

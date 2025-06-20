import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0oAjahslXXGOBbpcnu7erGU3doo88t8E",
  authDomain: "system-development-9bd2d.firebaseapp.com",
  projectId: "system-development-9bd2d",
  appId: "1:1017245886682:web:de761fffddda340b889de3"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const politicians = [ {
        "id": "poli_001",
        "name": "田中 太郎",
        "image_url": "https://example.com/images/tanaka_taro.png",
        "description": "田中太郎は日本の国会議員であり、地域の環境保護活動に積極的に取り組んでいます。",
        "hobbies": "釣り、読書、登山",
        "achievements": [
        {"year": 2015, "event": "初当選", "detail": "地方議会議員として初当選を果たす"},
        {"year": 2018, "event": "環境保護法案提出", "detail": "環境保護に関する新法案を国会に提出"},
        {"year": 2021, "event": "再選", "detail": "国会議員として再選される"}
        ],
        "tags": ["自由民主党", "環境保護", "地方活性化"]
    } ];

async function uploadPoliticians() {
  const colRef = collection(db, "politicians");
  for (const poli of politicians) {
    await setDoc(doc(colRef, poli.id), poli);
    console.log(`${poli.name} のデータをアップロードしました`);
  }
}

uploadPoliticians();

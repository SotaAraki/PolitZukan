import { app } from "./firebase.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore(app);

/**
 * 全politiciansコレクションを取得
 * @returns {Promise<Array>} politicianデータ配列
 */
export async function getAllPoliticians() {
  const snapshot = await getDocs(collection(db, "politicians"));
  return snapshot.docs.map(doc => doc.data());
}

/**
 * ユーザーが特定のカードを所持しているか確認
 * @param {string} userId
 * @param {string} cardId
 * @returns {Promise<boolean>}
 */
export async function checkUserHasCard(userId, cardId) {
  const ref = doc(db, "users", userId, "collection", cardId);
  const snap = await getDoc(ref);
  return snap.exists();
}

/**
 * ガチャを引いたタイムスタンプを保存
 * @param {string} userId
 */
export async function setGachaTimestamp(userId) {
  const ref = doc(db, "users", userId, "meta", "gacha");
  await setDoc(ref, {
    lastGacha: Timestamp.fromDate(new Date())
  });
}

/**
 * ユーザーのカードコレクションにカードを保存
 * @param {string} userId
 * @param {Object} cardData
 */
export async function saveUserCard(userId, cardData) {
  const cardId = cardData.id || cardData.image_url;
  const ref = doc(db, "users", userId, "collection", cardId);
  await setDoc(ref, {
    name: cardData.name,
    image_url: cardData.image_url,
    obtainedAt: new Date()
  });
}

/**
 * ガチャの最後の引いた時間を取得
 * @param {string} userId
 * @returns {Promise<Date|null>}
 */
export async function getLastGachaTime(userId) {
  const ref = doc(db, "users", userId, "meta", "gacha");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().lastGacha?.toDate() || null;
}

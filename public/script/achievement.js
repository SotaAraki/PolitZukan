// js/common/achievement.js
import { getFirestore, getDocs, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore();

/**
 * 党ごとのコンプ判定を行い、Firestoreの achievements に保存
 * @param {string} userId 
 */
export async function checkPartyCompletion(userId) {
  // 全カードを党ごとに分類
  const allCardsSnap = await getDocs(collection(db, "politicians"));
  const partyMap = {};
  allCardsSnap.forEach(doc => {
    const data = doc.data();
    if (!partyMap[data.party]) partyMap[data.party] = [];
    partyMap[data.party].push(data.id || data.image_url);
  });

  // ユーザーのコレクション取得
  const userCardsSnap = await getDocs(collection(db, "users", userId, "collection"));
  const userCardIds = userCardsSnap.docs.map(doc => doc.id);

  // 党ごとにコンプ判定して更新
  for (const [party, cardIds] of Object.entries(partyMap)) {
    const hasAll = cardIds.every(id => userCardIds.includes(id));
    if (hasAll) {
      await setDoc(
        doc(db, "users", userId, "achievements"),
        { [party]: true },
        { merge: true }
      );
    }
  }
}

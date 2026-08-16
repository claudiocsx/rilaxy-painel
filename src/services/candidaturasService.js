import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export async function listarCandidaturas() {
  const q = query(collection(db, 'candidaturas'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function aprovarCandidatura(id) {
  const codigoGerado = 'RX-' + Math.floor(1000 + Math.random() * 9000);
  await updateDoc(doc(db, 'candidaturas', id), { status: 'Aprovado', codigoGerado });
  return codigoGerado;
}

export async function recusarCandidatura(id) {
  await updateDoc(doc(db, 'candidaturas', id), { status: 'Recusado', codigoGerado: '' });
}

export async function excluirCandidatura(id) {
  await deleteDoc(doc(db, 'candidaturas', id));
}

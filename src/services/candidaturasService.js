import { db, auth } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';

export async function listarCandidaturas() {
  const q = query(collection(db, 'candidaturas'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function gerarCodigoUnico() {
  for (let i = 0; i < 10; i++) {
    const codigo = 'RX-' + Math.floor(1000 + Math.random() * 9000);
    const existente = await getDoc(doc(db, 'convites', codigo));
    if (!existente.exists()) return codigo;
  }
  throw new Error('Não foi possível gerar um código único. Tente novamente.');
}

export async function aprovarCandidatura(id) {
  const codigoGerado = await gerarCodigoUnico();
  const adminUid = auth.currentUser?.uid || 'sistema';
  await setDoc(doc(db, 'convites', codigoGerado), {
    codigo: codigoGerado,
    criadoPor: adminUid,
    criadoEm: Timestamp.now(),
    maxUsos: 1,
    usosAtuais: 0,
    usadoPor: [],
    ativo: true,
  });
  await updateDoc(doc(db, 'candidaturas', id), { status: 'Aprovado', codigoGerado });
  return codigoGerado;
}

export async function recusarCandidatura(id) {
  await updateDoc(doc(db, 'candidaturas', id), { status: 'Recusado', codigoGerado: '' });
}

export async function garantirConviteDaCandidatura(candidatura) {
  const codigo = candidatura?.codigoGerado;
  if (!codigo) return null;
  const ref = doc(db, 'convites', codigo);
  const existente = await getDoc(ref);
  if (existente.exists()) return codigo;
  await setDoc(ref, {
    codigo,
    criadoPor: auth.currentUser?.uid || 'sistema',
    criadoEm: Timestamp.now(),
    maxUsos: 1,
    usosAtuais: 0,
    usadoPor: [],
    ativo: true,
  });
  return codigo;
}

export async function excluirCandidatura(id) {
  await deleteDoc(doc(db, 'candidaturas', id));
}

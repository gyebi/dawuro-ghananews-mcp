import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type Story = {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  url?: string;
  createdAt?: unknown;
};

type SaveableStory = Story | (Omit<Story, "id"> & { id?: string });

export async function getStories(): Promise<Story[]> {
  const storiesRef = collection(db, "stories");
  const q = query(storiesRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Story, "id">),
  }));
}

export async function getStoryById(id: string): Promise<Story | null> {
  const storyRef = doc(db, "stories", id);
  const snapshot = await getDoc(storyRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Story, "id">),
  };
}


export async function saveStoryForLater(story: SaveableStory) {
  const savedRef = collection(db, "savedStories");

  await addDoc(savedRef, {
    storyId: story.id ?? story.url ?? story.title,
    title: story.title,
    summary: story.summary,
    source: story.source,
    category: story.category,
    url: story.url || "",
    savedAt: serverTimestamp(),
  });
}

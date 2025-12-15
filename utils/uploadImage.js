import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// file = selected file
// path = where to save in Firebase Storage (e.g. "jobs/<id>/setup/image1.jpg")
// onProgress = callback to update UI (optional)

export function uploadImage(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

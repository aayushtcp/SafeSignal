// UploadImage.jsx
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../context/myurl";

function UploadImage() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);

    try {
      await axios.post(`${API_URL}/images/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default UploadImage;

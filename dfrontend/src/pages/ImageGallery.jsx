// ImageGallery.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../context/myurl';

function ImageGallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/images/`)
      .then(res => {
        setImages(res.data);
      })
      .catch(err => {
        console.error(err);
      });
    }, []);
    console.log(images);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {images.map(img => (
        <div key={img.id} className="bg-white shadow-md rounded overflow-hidden">
          <h3 className="text-center font-semibold text-gray-700 p-2">{img.title}</h3>
          <img 
            src={img.image} 
            alt={img.title} 
            className="w-full h-48 object-cover" 
          />
        </div>
      ))}
    </div>
  );
}

export default ImageGallery;

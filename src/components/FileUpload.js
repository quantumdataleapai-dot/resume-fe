import React from "react";

export default function FileUpload({ onFilesSelected }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (onFilesSelected) onFilesSelected(files);
  };

  return (
    <div className="file-upload-component">
      <input
        type="file"
        multiple
        onChange={handleChange}
        style={{ display: "block" }}
      />
    </div>
  );
}

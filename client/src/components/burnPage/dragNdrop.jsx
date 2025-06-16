import React, { useState } from "react";

const DragAndDropFileInput = ({
    onFileSelect,
    id,
    // category = "default",
    clickFunction,
    singleFile,
}) => {
    const [dragging, setDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        let files = Array.from(e.dataTransfer.files);
        if (singleFile) {
            files = files.slice(0, 1);
        }
        setSelectedFiles(files);
        onFileSelect(files, id);
    };

    const handleFileSelect = (e) => {
        let files = Array.from(e.target.files || []);
        if (singleFile) {
            files = files.slice(0, 1);
        }
        setSelectedFiles(files);
        onFileSelect(files, id);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFileSelect(newFiles, id);
    };

    return (
        <div className="space-y-4 w-full  justify-self-center">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={clickFunction}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${dragging ? "border-teal-700 bg-teal-50" : "border-[#50D2C1]"
                    } cursor-pointer`}
            >
                {!clickFunction && (
                    <input
                        id={`file-input-${id}`}
                        type='file'
                        multiple={!singleFile}
                        onChange={handleFileSelect}
                        className='hidden'
                        accept="image/*"
                    />
                )}

                <label htmlFor={`file-input-${id}`} className='block space-y-3'>
                    <div className='flex justify-center'>
                        {selectedFiles.length === 0 ? (
                            <svg
                                className="w-12 h-12 text-custom-light-purple"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        ) : (
                            <div className="text-custom-light-purple">
                                {selectedFiles.length} file(s) selected
                            </div>
                        )}
                    </div>
                    <p className='text-custom-light-purple font-medium'>
                        {selectedFiles.length === 0 ? 'Drop your image here' : 'Drop to replace'}
                    </p>
                    <p className='text-custom-light-purple font-semibold underline'>
                        {selectedFiles.length === 0 ? 'Click here to upload image' : 'Click to change'}
                    </p>
                </label>
            </div>

            {/* Display selected files */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-inherit border border-[#50D2C1] p-3 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-sm text-[#50D2C1]">
                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DragAndDropFileInput;
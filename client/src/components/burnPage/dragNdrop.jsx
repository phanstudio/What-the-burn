import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, FileText, Check } from 'lucide-react';

// Drag and Drop File Input Component
export const DragAndDropFileInput = ({
    onFileUpload,
    error = null,
    required = false,
    acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
    maxSize = 10 * 1024 * 1024, // 10MB
    className = ""
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [localError, setLocalError] = useState('');
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        // Check file size
        if (file.size > maxSize) {
            setLocalError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
            return false;
        }

        // Check file type
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const isValidType = acceptedTypes.some(type => {
            if (type.includes('*')) {
                return fileType.startsWith(type.replace('*', ''));
            }
            return fileName.endsWith(type);
        });

        if (!isValidType) {
            setLocalError(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
            return false;
        }

        setLocalError('');
        return true;
    };

    const handleFileSelect = (file) => {
        if (validateFile(file)) {
            setUploadedFile(file);
            if (onFileUpload) {
                onFileUpload(file);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setLocalError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileUpload) {
            onFileUpload(null);
        }
    };

    const hasError = error || localError;

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-2">
                <label className="block text-sm font-medium text-white mb-1">
                    Upload File
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            </div>

            {!uploadedFile ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${hasError
                        ? 'border-red-400 bg-red-50/10'
                        : isDragOver
                            ? 'border-[#50D2C1] bg-[#50D2C1]/10'
                            : 'border-gray-300 hover:border-[#50D2C1] hover:bg-gray-50/5'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={acceptedTypes.join(',')}
                        onChange={handleFileInputChange}
                    />

                    <div className="flex flex-col items-center">
                        <Upload
                            size={48}
                            className={`mb-4 ${hasError ? 'text-red-400' : isDragOver ? 'text-[#50D2C1]' : 'text-gray-400'
                                }`}
                        />
                        <p className={`text-lg font-medium mb-2 ${hasError ? 'text-red-400' : 'text-white'
                            }`}>
                            {isDragOver ? 'Drop file here' : 'Drag & drop file here'}
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                            or click to browse files
                        </p>
                        <p className="text-gray-500 text-xs">
                            Supported: {acceptedTypes.join(', ')}
                            (Max {Math.round(maxSize / 1024 / 1024)}MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="border border-[#50D2C1] rounded-lg p-4 bg-[#50D2C1]/5">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <FileText size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                            <p className="text-gray-400 text-sm">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Check size={20} className="text-green-500" />
                            <button
                                onClick={removeFile}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            >
                                <X size={16} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {hasError && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {error || localError}
                </p>
            )}
        </div>
    );
};

export default DragAndDropFileInput;
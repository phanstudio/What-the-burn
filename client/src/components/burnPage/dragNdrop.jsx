import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Upload, X, AlertCircle, FileText, Check } from 'lucide-react';

const DragAndDropFileInput = forwardRef(({
    onFileUpload,
    error = null,
    required = false,
    acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
    maxSize = 10 * 1024 * 1024, // 10MB
    className = "",
    initialFiles = []
}, ref) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState(initialFiles);
    const [localError, setLocalError] = useState('');
    const fileInputRef = useRef(null);

    // Sync with parent component's state
    useEffect(() => {
        if (initialFiles && !uploadedFiles.length && initialFiles.length) {
            setUploadedFiles(initialFiles);
        }
    }, [initialFiles]);

    const validateFile = (file) => {
        if (!file) {
            setLocalError('Please select a file');
            return false;
        }

        if (file.size > maxSize) {
            setLocalError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
            return false;
        }

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

        return true;
    };

    const handleFileSelect = (files) => {
        if (files.length === 0) {
            setLocalError(required ? 'Please select at least one file' : '');
            setUploadedFiles([]);
            if (onFileUpload) onFileUpload([]);
            return;
        }

        const validFiles = [];
        for (const file of files) {
            if (validateFile(file)) {
                validFiles.push(file);
            } else {
                return;
            }
        }

        setUploadedFiles(validFiles);
        if (onFileUpload) {
            onFileUpload(validFiles);
        }
        setLocalError('');
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
        handleFileSelect(files);
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        handleFileSelect(files);
    };

    const removeFile = (index) => {
        const newFiles = [...uploadedFiles];
        newFiles.splice(index, 1);
        setUploadedFiles(newFiles);
        setLocalError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileUpload) {
            onFileUpload(newFiles);
        }
    };

    // ✅ Expose reset method
    useImperativeHandle(ref, () => ({
        reset: () => {
            setUploadedFiles([]);
            setLocalError('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            if (onFileUpload) {
                onFileUpload([]);
            }
        }
    }));

    const hasError = error || localError;

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-2">
                <label className="block text-sm font-medium text-white mb-1">
                    Upload PFP Image
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            </div>

            {uploadedFiles.length === 0 ? (
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
                            className={`mb-4 ${hasError ? 'text-red-400' : isDragOver ? 'text-[#50D2C1]' : 'text-gray-400'}`}
                        />
                        <p className={`text-lg font-medium mb-2 ${hasError ? 'text-red-400' : 'text-white'}`}>
                            {isDragOver ? 'Drop image here' : 'Drag & drop image here'}
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                            or click to browse files
                        </p>
                        <p className="text-gray-500 text-xs">
                            Supported: {acceptedTypes.join(', ')} (Max {Math.round(maxSize / 1024 / 1024)}MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="border border-[#50D2C1] rounded-lg p-4 bg-[#50D2C1]/5">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <FileText size={20} className="text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{file.name}</p>
                                    <p className="text-gray-400 text-sm">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Check size={20} className="text-green-500" />
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                    >
                                        <X size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
});

export default DragAndDropFileInput;

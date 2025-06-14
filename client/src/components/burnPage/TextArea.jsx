import React from 'react'

function TextArea() {
    return (
        <div className=' w-56 justify-self-center'>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
            <input
                type="url"
                id="name"
                className={`w-full bg-gray-800 border rounded px-4 py-2 text-white no-background`}
                placeholder="name of NFT"
                onChange={(e) => setTokenWebsite(e.target.value)}
            />
            {/* {validationErrors.tokenWebsite && <p className="text-red-500 text-sm mt-1">{validationErrors.tokenWebsite}</p>} */}
        </div>
    )
}

export default TextArea
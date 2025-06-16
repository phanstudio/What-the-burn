import React from 'react'

function TextArea() {
    return (
        <div className=' '>
            <label htmlFor="name" className="block text-sm text-[#50D2C1]  font-medium mb-2">Name</label>
            <input
                type="url"
                id="name"
                className={` bg-transparent border border-[#50D2C1] rounded w-full px-4 py-2 text-white no-background`}
                placeholder="name of NFT"
                onChange={(e) => setTokenWebsite(e.target.value)}
            />
            {/* {validationErrors.tokenWebsite && <p className="text-red-500 text-sm mt-1">{validationErrors.tokenWebsite}</p>} */}
        </div>
    )
}

export default TextArea
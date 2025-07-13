import React from 'react'

function nftIcon() {
    return (
        <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            {/* Background circle  */}
            <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke="#6c757d" stroke-width="2" />

            {/* NFT Frame */}
            <rect x="25" y="25" width="50" height="40" fill="#ffffff" stroke="#6c757d" stroke-width="1.5" rx="2" />

            {/* Inner image area  */}
            <rect x="27" y="27" width="46" height="36" fill="#e9ecef" stroke="#adb5bd" stroke-width="0.5" rx="1" />

            {/* Abstract geometric shapes to represent digital art  */}
            <polygon points="35,35 45,30 55,40 40,45" fill="#6c757d" opacity="0.3" />
            <circle cx="60" cy="35" r="6" fill="#6c757d" opacity="0.4" />
            <rect x="45" y="50" width="15" height="8" fill="#6c757d" opacity="0.2" rx="1" />

            {/* NFT label  */}
            <rect x="25" y="67" width="50" height="8" fill="#495057" rx="1" />
            <text x="50" y="73" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">NFT</text>

            {/* Blockchain link indicators (small dots)  */}
            <circle cx="30" cy="80" r="2" fill="#6c757d" />
            <circle cx="38" cy="80" r="2" fill="#6c757d" />
            <circle cx="46" cy="80" r="2" fill="#6c757d" />
            <circle cx="54" cy="80" r="2" fill="#6c757d" />
            <circle cx="62" cy="80" r="2" fill="#6c757d" />
            <circle cx="70" cy="80" r="2" fill="#6c757d" />

            {/* Connecting lines between dots  */}
            <line x1="32" y1="80" x2="36" y2="80" stroke="#6c757d" stroke-width="1" />
            <line x1="40" y1="80" x2="44" y2="80" stroke="#6c757d" stroke-width="1" />
            <line x1="48" y1="80" x2="52" y2="80" stroke="#6c757d" stroke-width="1" />
            <line x1="56" y1="80" x2="60" y2="80" stroke="#6c757d" stroke-width="1" />
            <line x1="64" y1="80" x2="68" y2="80" stroke="#6c757d" stroke-width="1" />
        </svg></div>
    )
}

export default nftIcon
import React from 'react'
import videob from "../../assets/What the burn Landing .mp4"

function VideoBackground() {
    return (
        <div>
            <video autoPlay
                loop
                muted
                playsInline
                onError={(e) => console.error("Video failed to load", e)}
                className=' absolute top-0 left-0 w-full h-full object-cover z-0' src={videob} />
        </div>
    )
}

export default VideoBackground
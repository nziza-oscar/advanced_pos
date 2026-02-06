import React from 'react'

const Titles = ({title="", description=""}) => {
  return (
    <div className="relative mb-6">
      <h3 className="text-xl font-black text-primary uppercase  leading-none tracking-wide">
       {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 mt-1">
       {description}
      </p>
    </div>
  )
}

export default Titles
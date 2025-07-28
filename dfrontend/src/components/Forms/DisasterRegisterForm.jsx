"use client"

import { useState } from "react"

const DisasterRegisterForm = () => {
  const [rehabType, setRehabType] = useState("")
  const [description, setDescription] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log({ rehabType, description, customLocation })
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-purple-700 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Rehab Information</h2>
      </div>
      <div className="p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="rehab-type" className="block text-sm font-medium text-purple-800">
                Rehab Type
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full bg-white border border-purple-300 rounded-md py-2 px-3 text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={isSelectOpen}
                  id="rehab-type"
                >
                  {rehabType || "Select rehab type"}
                </button>
                {isSelectOpen && (
                  <ul
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                    tabIndex="-1"
                    role="listbox"
                    aria-labelledby="rehab-type"
                  >
                    {["Physical", "Occupational", "Speech", "Cognitive"].map((type) => (
                      <li
                        key={type}
                        className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-purple-100"
                        role="option"
                        onClick={() => {
                          setRehabType(type)
                          setIsSelectOpen(false)
                        }}
                      >
                        {type}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-purple-800">
                Location (Read-only)
              </label>
              <input
                type="text"
                id="location"
                value="Default Location"
                readOnly
                className="w-full bg-purple-50 text-purple-800 border-purple-300 rounded-md py-2 px-3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-purple-800">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter rehab description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-purple-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-location" className="block text-sm font-medium text-purple-800">
              Custom Location
            </label>
            <input
              type="text"
              id="custom-location"
              placeholder="Enter custom location"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full bg-white border border-purple-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default DisasterRegisterForm


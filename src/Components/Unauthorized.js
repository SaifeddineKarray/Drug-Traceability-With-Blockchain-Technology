import React from 'react'
import "./unauthorized.css"
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="unauth">
    <div className="unauth-404"></div>
    <h1>Unauthorized</h1>
    <p>Oops! You Do Not Have Access To This Page</p>
    <Link to="/">Back to homepage</Link>
  </div>
  )
}

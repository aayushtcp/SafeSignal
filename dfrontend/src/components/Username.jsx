import {useState, useContext} from 'react'
import { NameContext } from '../context/NameContext'

const Username = () => {
    const value = useContext(NameContext);
    console.log(value);
    return (
        <span>
            {useContext(value.count)}
        </span>
    )
}

export default Username
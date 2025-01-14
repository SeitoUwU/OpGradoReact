import React from "react";
import axios from 'axios';
import { useEffect } from "react";
import { useState } from "react";
import { toast, Toaster } from 'react-hot-toast';
import SensorTable from "./components/sensorTable";
import SensorOptions from "./components/sensorOptions";

function Index() {
    useEffect(() => {
        toast.success('Bienvenido', {
            duration: 1500,
            position: 'top-right',
        });
    }, []);

    useEffect(() => {
        getSensors();
        getSensorStates();
    }, []);

    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState([]);


    const getSensors = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/sensor/getSensor');
            setSensors(response.data.data);
        } catch (error) {
            setLoading(false);
        }
    }

    const getSensorStates = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/sensor/getSensorStates');
            setStates(response.data.data.map((state) => state.ESTADO));
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Toaster />
            <div className="container mx-auto">
                <SensorOptions
                    sensorStates={states}
                    setSensors={setSensors} 
                    refreshSensors={getSensors}/>
                <SensorTable sensors={sensors} loading={loading} />
            </div>
        </>
    )
}
export default Index;
import React from "react";
import axios from "axios";
import TankOptions from "./components/TankOptions";
import TankTable from "./components/TankTable";
import { useEffect, useState } from "react";

function Index() {
    useEffect(() => {
        getTanks();
    }, []);

    const [tanks, setTanks] = useState([]);
    const [loading, setLoading] = useState(true);


    const filterTanksById = async (value) => {
        try {
            const response = await axios.post('http://localhost:3000/api/tank/filterTankById', {
                tankId: value
            });
            setTanks(response.data.data);
        } catch (error) {
            setLoading(false);
        }
    }

    const filterTankByNitClient = async (value) => {
        try {
            const response = await axios.post('http://localhost:3000/api/tank/filterTankByNitClient', {
                nitClient: value
            });
            setTanks(response.data.data);
        } catch (error) {
            setLoading(false);
        }
    }

    const getTanks = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/tank/getTanks');
            setTanks(response.data.data);
        } catch (error) {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="container mx-auto">
                <TankOptions
                    getTanks={getTanks}
                    filterTanksById={filterTanksById}
                    filterTankByNitClient={filterTankByNitClient}
                />
                <TankTable
                    tanks={tanks}
                    loading={loading}
                />
            </div>
        </>
    )

}

export default Index;
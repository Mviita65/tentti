import React, { useState } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

const ChartExample = ({otsikot,tiedot,tyyppi,valinta}) => {
    // set data
    const [chartData, setChartData] = useState({
        // labels: ['label 1', 'label 2', 'label 3', 'label 4'],
        labels: otsikot,
        datasets: [
            {
                label: 'test label',
                data: tiedot,
                // data: [
                //     48,
                //     35,
                //     73,
                //     82
                // ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderWidth: 3
            }
        ]
    });

    // set options
    const [chartOptions, setChartOptions] = useState({
        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ]
            },
            title: {
                display: true,
                text: 'Data Orgranized In Bars',
                fontSize: 25
            },
            legend: {
                display: true,
                position: 'top'
            }
        }
    });

    
    // return JSX
    return (
       <div className="BarExample">
        {tyyppi} <br></br>
        {(valinta==="Doughnut") ? 
            <Doughnut
            data={chartData}
            options={chartOptions} />: 
        (valinta==="Bar") ?
            <Bar
            data={chartData}
            options={chartOptions} />: 
        ""}
      </div>
);
}

export default ChartExample;
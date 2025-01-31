import * as React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { type City } from '../api.generated';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function MapMarker(props: {
  city: City;
}): React.ReactElement {
  // This function => downloads the discription in the text file format
  const downloadDescriptionFunc = () : void =>{
    const descString = props.city.shortDescription;
    const filename = 'description.txt';
    const element = document.createElement('a');
    const file = new Blob([descString], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  return (
    <Marker position={{ lat: props.city.lat, lng: props.city.lng }}>
      <Popup>
        <Typography>
          {props.city.shortDescription}
        </Typography>
        <Button size='small' variant='contained' color='primary' onClick={downloadDescriptionFunc} >Download description</Button>
      </Popup>
    </Marker>
  );
}

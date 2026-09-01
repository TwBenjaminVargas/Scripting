import si from 'systeminformation';

const ps = async () => {return await si.processes()}
export {ps};
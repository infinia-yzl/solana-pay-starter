import { useState, useEffect } from 'react';

const useIPFS = (hash: string, filename: string) => {
  const [file, setFile] = useState('');

  useEffect(() => setFile(`https://gateway.ipfscdn.io/ipfs/${hash}?filename=${filename}`), [hash, filename]);

  return file;
};

export default useIPFS;

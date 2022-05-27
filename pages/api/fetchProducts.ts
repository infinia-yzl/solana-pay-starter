import products from "./products.json"

export default function handler(req: { method: string; }, res: {
    status: (arg0: number) => {
      (): any; new(): any; json: {
        (arg0: {
          id: number; name // If get request
            : string; price: string; description: string; image_url: string;
        }[]): void; new(): any;
      }; send: { (arg0: string): void; new(): any; };
    };
  }) {
  // If get request
  if (req.method === "GET") {
    // Create a copy of products without the hashes and filenames
    const productsNoHashes = products.map((product) => {
      const { hash, filename, ...rest } = product;
      return rest;
    });

    res.status(200).json(productsNoHashes);
  }
  else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
}

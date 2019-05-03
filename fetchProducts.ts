// IMPORTS PART--------------------------------------------------
import axios from 'axios'
import { v } from 'explained-quartet'

// TYPE DEFINITIONS PART-----------------------------------------


type FetchProductsResponseProduct = {}

type FetchProductsResponse = {
  products: FetchProductsResponseProduct[]
  productsTotalCount: number
  productsOnPage: number
  page: number
  pagesTotalCount: number
}

const checkResponse = v({
  "products": v.arrayOf("object!"),
  "productsTotalCount": "safe-integer",
  "productsOnPage": "safe-integer",
  "page": "safe-integer",
  "pagesTotalCount": "safe-integer"
})

// FUNCTION PART-------------------------------------------------
// url: /api/catalog/products, method: get
export async function fetchProducts(): Promise<FetchProductsResponse> {
  
  
  const URL = "/api/catalog/products"
  
  const { data: response } = await axios.get(URL)
  
  v.clearContext()
  if (!checkResponse(response)) {
    console.debug(v.explanation)
    throw new TypeError("Wrong fetchProducts response")
  }
  
  
  
  return response as FetchProductsResponse
}
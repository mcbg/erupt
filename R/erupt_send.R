#' @import httr jsonlite
#' @export
erupt_send <- function(ds) {
  POST('http://127.0.0.1:8999/api', body = toJSON(ds), encode = 'raw')
}

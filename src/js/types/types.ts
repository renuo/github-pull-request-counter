export interface Issue {
  id: number,
  assignee: string | undefined,
  pull_request: {
    url: string,
    html_url: string
  }
}
